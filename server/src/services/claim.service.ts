import path from "path";
import fs from "fs";
import Claim from "../models/claim.model";
import { uploadToS3, deleteFromS3 } from "./s3Service";
import { generateSummary } from "./aiService";
import mongoose, { Types } from "mongoose";
export type CreateClaimInput = {
  name: string;
  description: string;
  policy: Types.ObjectId;
  summary?: string;
};

export type UpdateClaimInput = Partial<{
  name: string;
  description: string;
  policy: Types.ObjectId;
  fileUrl: string | null;
  summary?: string;
  fileS3Url: string | null;
  fileS3Key: string | null;
  fileLocalPath: string | null;
}>;

const isDev = process.env.NODE_ENV === "development";

export async function listClaims() {
  const claims = await Claim.find()
    .sort({ createdAt: -1 })
    .populate("policy", "policyNumber");
  return claims;
}

export async function getClaimById(id: string) {
  return await Claim.findById(id).populate("policy", "policyNumber");
}

export async function createClaim(
  data: CreateClaimInput,
  file?: Express.Multer.File
) {
  const summary = data.summary ?? (await generateSummary(data.description));

  let fileData: UpdateClaimInput = {
    fileUrl: null,
    fileS3Url: null,
    fileS3Key: null,
    fileLocalPath: null,
  };

  if (file) {
    const uploadResult = await uploadToS3(file);
    fileData = {
      fileUrl: uploadResult.s3Url,
      fileS3Url: uploadResult.s3Url,
      fileS3Key: uploadResult.key,
      fileLocalPath: isDev ? uploadResult.localPath || null : null,
    };
  }

  const newClaim = new Claim({
    name: data.name,
    description: data.description,
    policy: data.policy, // <- correct field on schema
    summary,
    ...fileData,
  });

  return newClaim.save();
}

export async function updateClaim(
  id: string,
  payload: UpdateClaimInput,
  file?: Express.Multer.File
) {
  const claim = await Claim.findById(id);
  if (!claim) return null;

  const updateData: UpdateClaimInput = { ...payload };

  if (file) {
    if (claim.fileS3Key) {
      try {
        await deleteFromS3(claim.fileS3Key);
      } catch (e) {
        console.error("S3 delete error:", e);
      }
    }

    const uploadResult = await uploadToS3(file);
    updateData.fileUrl = uploadResult.s3Url;
    updateData.fileS3Url = uploadResult.s3Url;
    updateData.fileS3Key = uploadResult.key;
    updateData.fileLocalPath = isDev ? uploadResult.localPath || null : null;
  }

  if (updateData.description) {
    updateData.summary = await generateSummary(updateData.description);
  }



  if (updateData.summary === undefined) {
    delete updateData.summary;
  }
  return Claim.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
}

export async function deleteClaim(id: string) {
  if (!mongoose.isValidObjectId(id)) return null;

  const claim = await Claim.findById(id);
  if (!claim) return null;

  if (claim.fileS3Key) {
    try {
      await deleteFromS3(claim.fileS3Key);
    } catch (e) {
      console.error("S3 delete error:", e);
    }
  }

  if (claim.fileLocalPath && isDev) {
    const localPath = path.join(process.cwd(), claim.fileLocalPath);
    if (fs.existsSync(localPath)) {
      try {
        fs.unlinkSync(localPath);
      } catch (e) {
        console.error("Local delete error:", e);
      }
    }
  }

  await Claim.findByIdAndDelete(id);
  return claim;
}
