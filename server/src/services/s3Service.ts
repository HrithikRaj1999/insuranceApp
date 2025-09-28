import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, PutObjectCommandInput } from "@aws-sdk/client-s3";
import { getSignedUrl as presign } from "@aws-sdk/s3-request-presigner";
import fs from "fs";
import path from "path";
const region = () => process.env.AWS_REGION;
const bucket = () => process.env.S3_BUCKET_NAME;
const keyPrefix = () => process.env.AWS_S3_PREFIX!.replace(/^\/+|\/+$/g, "");
const isDev = () => process.env.NODE_ENV === "development";
const defaultACL = () => process.env.S3_OBJECT_ACL;
const s3 = new S3Client({
  region: region()
});
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
function canUseS3(): {
  ok: true;
} | {
  ok: false;
  reason: string;
} {
  if (!bucket()) {
    return {
      ok: false,
      reason: "S3_BUCKET_NAME is not configured"
    };
  }
  return {
    ok: true
  };
}
function finalizeLocalFile(tempPath: string): {
  localPath?: string;
} {
  let localPath: string | undefined;
  try {
    if (isDev()) {
      const localDir = path.join(process.cwd(), "uploads");
      if (!fs.existsSync(localDir)) {
        fs.mkdirSync(localDir, {
          recursive: true
        });
      }
      const newPath = path.join(localDir, path.basename(tempPath));
      fs.renameSync(tempPath, newPath);
      localPath = `/uploads/${path.basename(newPath)}`;
    } else {
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    }
  } catch (e) {
    try {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    } catch {}
    warn("finalize", "Local temp cleanup warning", {
      error: String(e)
    });
  }
  return {
    localPath
  };
}
export async function uploadToS3(file: Express.Multer.File): Promise<FileUploadResult> {
  const pre = canUseS3();
  const safeName = path.basename(file.originalname).replace(/\s/g, "-");
  const key = `${keyPrefix()}/${Date.now()}-${safeName}`;
  if (!pre.ok) {
    const {
      localPath
    } = finalizeLocalFile(file.path);
    warn("upload-skip", `Skipping S3 upload: ${pre.reason}`, {
      filename: safeName
    });
    return {
      s3Url: null,
      key: null,
      localPath,
      skipped: true,
      reason: pre.reason
    };
  }
  try {
    const bodyStream = fs.createReadStream(file.path);
    const putParams: PutObjectCommandInput = {
      Bucket: bucket(),
      Key: key,
      Body: bodyStream,
      ContentType: file.mimetype,
      ACL: defaultACL() as any
    };
    await s3.send(new PutObjectCommand(putParams));
    const s3Url = `https://${bucket()}.s3.${region}.amazonaws.com/${encodeURIComponent(key)}`;
    const {
      localPath
    } = finalizeLocalFile(file.path);
    return {
      s3Url,
      key,
      localPath
    };
  } catch (e) {
    const {
      localPath
    } = finalizeLocalFile(file.path);
    warn("upload-fail", "S3 upload failed—returning local-only result", {
      error: String(e),
      bucket: bucket(),
      key
    });
    return {
      s3Url: null,
      key: null,
      localPath,
      skipped: true,
      reason: `S3 upload failed: ${e}`
    };
  }
}
export async function deleteFromS3(key: string): Promise<void> {
  const pre = canUseS3();
  if (!pre.ok) {
    warn("delete-skip", `Skipping S3 delete: ${pre.reason}`, {
      key
    });
    return;
  }
  if (!key) {
    warn("delete-skip", "Skipping S3 delete: empty key");
    return;
  }
  try {
    await s3.send(new DeleteObjectCommand({
      Bucket: bucket(),
      Key: key
    }));
  } catch (e) {
    warn("delete-fail", "S3 delete failed (ignored)", {
      error: String(e),
      key
    });
  }
}
export async function getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
  const pre = canUseS3();
  if (!pre.ok) {
    warn("signedurl-skip", `Skipping signed URL: ${pre.reason}`, {
      key
    });
    return "";
  }
  if (!key) {
    warn("signedurl-skip", "Skipping signed URL: empty key");
    return "";
  }
  try {
    const cmd = new GetObjectCommand({
      Bucket: bucket(),
      Key: key
    });
    return await presign(s3, cmd, {
      expiresIn
    });
  } catch (e) {
    warn("signedurl-fail", "Signed URL generation failed (returning empty)", {
      error: String(e),
      key
    });
    return "";
  }
}
export async function verifyS3Access(): Promise<{
  success: boolean;
  error?: string;
}> {
  const pre = canUseS3();
  if (!pre.ok) {
    return {
      success: false,
      error: pre.reason
    };
  }
  try {
    const testKey = `${keyPrefix()}/health-check-${Date.now()}.txt`;
    await s3.send(new PutObjectCommand({
      Bucket: bucket(),
      Key: testKey,
      Body: "health check",
      ContentType: "text/plain"
    }));
    await s3.send(new DeleteObjectCommand({
      Bucket: bucket(),
      Key: testKey
    }));
    return {
      success: true
    };
  } catch (e) {
    return {
      success: false,
      error: `S3 access verification failed: ${e}`
    };
  }
}