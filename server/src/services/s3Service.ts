
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommandInput,
} from '@aws-sdk/client-s3';
import { getSignedUrl as presign } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import path from 'path';

const region   = process.env.AWS_REGION || 'us-east-1';
const bucket   = process.env.S3_BUCKET_NAME || ''; // may be empty
const keyPrefix = (process.env.AWS_S3_PREFIX || 'claims').replace(/^\/+|\/+$/g, ''); // 'claims'
const isDev    = process.env.NODE_ENV === 'development';
const defaultACL = process.env.S3_OBJECT_ACL || 'public-read'; // or 'private'


const s3 = new S3Client({ region });

/** Result from uploadToS3. If skipped, s3Url/key are null and you get reason. */
export interface FileUploadResult {
  s3Url: string | null;
  key: string | null;
  localPath?: string;
  skipped?: boolean;
  reason?: string;
}

function warn(label: string, msg: string, extra?: Record<string, unknown>) {
  const base = `[S3:${label}] ${msg}`;
  if (extra) {
    console.warn(base, extra);
  } else {
    console.warn(base);
  }
}

/** Quick preflight check to decide if we can upload to S3. */
function canUseS3(): { ok: true } | { ok: false; reason: string } {
  if (!bucket) return { ok: false, reason: 'S3_BUCKET_NAME is not set' };

  return { ok: true };
}

/** Always clean/move the local temp file. */
function finalizeLocalFile(tempPath: string): { localPath?: string } {
  let localPath: string | undefined;
  try {
    if (isDev) {
      const localDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(localDir)) fs.mkdirSync(localDir, { recursive: true });
      const newPath = path.join(localDir, path.basename(tempPath));
      fs.renameSync(tempPath, newPath);
      localPath = `/uploads/${path.basename(newPath)}`;
    } else {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    }
  } catch (e) {

    try { if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath); } catch {}
    warn('finalize', 'Local temp cleanup warning', { error: String(e) });
  }
  return { localPath };
}

/**
 * Uploads a Multer temp file to S3 if possible.
 * - If S3 not configured/available: SKIPS upload, logs why, and still finalizes local file.
 * - In dev, you’ll get localPath for preview; in prod, the temp file is deleted.
 */
export async function uploadToS3(file: Express.Multer.File): Promise<FileUploadResult> {
  const pre = canUseS3();
  const safeName = path.basename(file.originalname).replace(/\s/g, '-');
  const key = `${keyPrefix}/${Date.now()}-${safeName}`;

  if (!pre.ok) {
    const { localPath } = finalizeLocalFile(file.path);
    warn('upload-skip', `Skipping S3 upload: ${pre.reason}`, { filename: safeName });
    return { s3Url: null, key: null, localPath, skipped: true, reason: pre.reason };
  }


  try {
    const bodyStream = fs.createReadStream(file.path);
    const putParams: PutObjectCommandInput = {
      Bucket: bucket,
      Key: key,
      Body: bodyStream,
      ContentType: file.mimetype,
      ACL: defaultACL as any, // 'public-read' | 'private' etc.
    };
    await s3.send(new PutObjectCommand(putParams));

    const s3Url = `https://${bucket}.s3.${region}.amazonaws.com/${encodeURIComponent(key)}`;
    const { localPath } = finalizeLocalFile(file.path);

    return { s3Url, key, localPath };
  } catch (e) {
    const { localPath } = finalizeLocalFile(file.path);
    warn('upload-fail', 'S3 upload failed—returning local-only result', {
      error: String(e),
      bucket,
      key,
    });

    return {
      s3Url: null,
      key: null,
      localPath,
      skipped: true,
      reason: 'S3 upload failed',
    };
  }
}

/** Best-effort delete: if we can’t delete, log and return (don’t throw). */
export async function deleteFromS3(key: string): Promise<void> {
  const pre = canUseS3();
  if (!pre.ok) {
    warn('delete-skip', `Skipping S3 delete: ${pre.reason}`, { key });
    return;
  }
  if (!key) {
    warn('delete-skip', 'Skipping S3 delete: empty key');
    return;
  }
  try {
    await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  } catch (e) {
    warn('delete-fail', 'S3 delete failed (ignored)', { error: String(e), key });
  }
}

/**
 * Returns a signed URL if S3 is available; otherwise returns '' and warns.
 * Use when `S3_OBJECT_ACL=private` or the bucket is not public.
 */
export async function getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
  const pre = canUseS3();
  if (!pre.ok) {
    warn('signedurl-skip', `Skipping signed URL: ${pre.reason}`, { key });
    return '';
  }
  if (!key) {
    warn('signedurl-skip', 'Skipping signed URL: empty key');
    return '';
  }
  try {
    const cmd = new GetObjectCommand({ Bucket: bucket, Key: key });
    return await presign(s3, cmd, { expiresIn });
  } catch (e) {
    warn('signedurl-fail', 'Signed URL generation failed (returning empty)', {
      error: String(e),
      key,
    });
    return '';
  }
}
