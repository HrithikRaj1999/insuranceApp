import AWS from 'aws-sdk';
import fs from 'fs';
import path from 'path';


const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

interface FileUploadResult {
  s3Url: string;
  localPath?: string;
  key: string;
}

export async function uploadToS3(file: Express.Multer.File): Promise<FileUploadResult> {
  const isDev = process.env.NODE_ENV === 'development';
  const fileStream = fs.createReadStream(file.path);
  const fileKey = `claims/${Date.now()}-${file.originalname.replace(/\s/g, '-')}`;
  
  const params = {
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: fileKey,
    Body: fileStream,
    ContentType: file.mimetype,
    ACL: 'public-read' // or 'private' if we want private access
  };
  
  try {

    const result = await s3.upload(params).promise();
    
    let localPath: string | undefined;
    
    if (isDev) {

      const localDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(localDir)) {
        fs.mkdirSync(localDir, { recursive: true });
      }
      
      localPath = `/uploads/${path.basename(file.path)}`;

      const newPath = path.join(localDir, path.basename(file.path));
      fs.renameSync(file.path, newPath);
    } else {

      fs.unlinkSync(file.path);
    }
    
    return {
      s3Url: result.Location,
      localPath,
      key: fileKey
    };
  } catch (error) {

    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    throw error;
  }
}

export async function deleteFromS3(key: string): Promise<void> {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: key
  };
  
  await s3.deleteObject(params).promise();
}

export async function getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: key,
    Expires: expiresIn // URL expires in 1 hour by default
  };
  
  return s3.getSignedUrl('getObject', params);
}