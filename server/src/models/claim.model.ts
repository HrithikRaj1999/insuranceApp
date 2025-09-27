import mongoose, { Document, Schema } from "mongoose";
import { IPolicy } from "./policy.model";
export interface IClaim extends Document {
  name: string;
  policy: IPolicy["_id"];
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
    policy: {
      type: Schema.Types.ObjectId,
      ref: "Policy",
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
    },
    fileUrls: {
      type: [String],
      default: null,
    },
    fileS3Urls: {
      type: [String],
      default: null,
    },
    fileS3Keys: {
      type: [String],
      default: null,
    },
    fileLocalPaths: {
      type: [String],
      default: null,
    },
  },
  {
    timestamps: true,
  }
);
export default mongoose.model<IClaim>("Claim", ClaimSchema);
