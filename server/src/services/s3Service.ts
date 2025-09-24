import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, PutObjectCommandInput } from '@aws-sdk/client-s3';
import { getSignedUrl as presign } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import path from 'path';

const region = process.env.AWS_REGION || 'us-east-1';
const bucket = process.env.S3_BUCKET_NAME!;
const keyPrefix = (process.env.AWS_S3_PREFIX || 'claims/').replace(/^\/+|\/+$/g, ''); // trim leading/trailing '/'
const isDev = process.env.NODE_ENV === 'development';
const defaultACL = process.env.S3_OBJECT_ACL || 'public-read'; // or 'private'


const s3 = new S3Client({ region });

export interface FileUploadResult {
  s3Url: string;
  localPath?: string;
  key: string;
}

/**
 * Uploads a Multer temp file to S3.
 * - In dev: moves original temp file to /uploads for easy local viewing.
 * - In prod: deletes local temp after upload.
 */
export async function uploadToS3(file: Express.Multer.File): Promise<FileUploadResult> {
  if (!bucket) throw new Error('S3_BUCKET_NAME is not set');


  const safeName = path.basename(file.originalname).replace(/\s/g, '-');
  const fileKey = `${keyPrefix ? keyPrefix + '/' : ''}${Date.now()}-${safeName}`;


  const bodyStream = fs.createReadStream(file.path);


  const putParams: PutObjectCommandInput = {
    Bucket: bucket,
    Key: fileKey,
    Body: bodyStream,
    ContentType: file.mimetype,
    ACL: defaultACL as any, // 'public-read' or 'private' etc.
  };


  await s3.send(new PutObjectCommand(putParams));


  const s3Url = `https://${bucket}.s3.${region}.amazonaws.com/${encodeURIComponent(fileKey)}`;


  let localPath: string | undefined;
  try {
    if (isDev) {
      const localDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(localDir)) fs.mkdirSync(localDir, { recursive: true });

      const newPath = path.join(localDir, path.basename(file.path));
      fs.renameSync(file.path, newPath);
      localPath = `/uploads/${path.basename(newPath)}`;
    } else {

      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    }
  } catch (moveErr) {

    try {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    } catch {}

    console.warn('Local temp cleanup warning:', moveErr);
  }

  return { s3Url, localPath, key: fileKey };
}

/**
 * Deletes an object from S3 by key.
 */
export async function deleteFromS3(key: string): Promise<void> {
  if (!bucket) throw new Error('S3_BUCKET_NAME is not set');
  await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

/**
 * Returns a time-limited signed URL for private objects.
 * Use when `ACL=private` or the bucket is not public.
 */
export async function getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
  if (!bucket) throw new Error('S3_BUCKET_NAME is not set');
  const cmd = new GetObjectCommand({ Bucket: bucket, Key: key });
  return presign(s3, cmd, { expiresIn });
}
