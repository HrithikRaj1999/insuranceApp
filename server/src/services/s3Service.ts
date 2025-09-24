import AWS from 'aws-sdk';
import fs from 'fs';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

export async function uploadToS3(file: Express.Multer.File): Promise<string> {
  const fileStream = fs.createReadStream(file.path);
  
  const params = {
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: `claims/${Date.now()}-${file.originalname}`,
    Body: fileStream,
    ContentType: file.mimetype
  };
  
  const result = await s3.upload(params).promise();
  fs.unlinkSync(file.path);
  
  return result.Location;
}