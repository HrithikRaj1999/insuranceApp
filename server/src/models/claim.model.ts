import mongoose, { Document, Schema } from 'mongoose';

export interface IClaim extends Document {
  name: string;
  policyId: string;
  description: string;
  summary?: string;
  fileUrl?: string;
  fileS3Url?: string;
  fileS3Key?: string;
  fileLocalPath?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClaimSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    policyId: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
    },
    fileUrl: {
      type: String, // This will be the primary URL (S3 or local based on env)
    },
    fileS3Url: {
      type: String, // Always stores S3 URL
    },
    fileS3Key: {
      type: String, // S3 object key for future operations
    },
    fileLocalPath: {
      type: String, // Local path (only in dev)
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IClaim>('Claim', ClaimSchema);