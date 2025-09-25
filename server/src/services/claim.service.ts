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

  fileUrls: string[] | null;
  fileS3Urls: string[] | null;
  fileS3Keys: string[] | null;
  fileLocalPaths: string[] | null;
}>;

const isDev = process.env.NODE_ENV === "development";

export async function listClaims() {
  return Claim.find().sort({ createdAt: -1 }).populate("policy", "policyNumber");
}

export async function getClaimById(id: string) {
  return Claim.findById(id).populate("policy", "policyNumber");
}

export async function createClaim(
  data: CreateClaimInput,
  files?: Express.Multer.File[]
) {
  const summary = data.summary ?? (await generateSummary(data.description));

  let fileData: UpdateClaimInput = {
    fileUrl: null,
    fileS3Url: null,
    fileS3Key: null,
    fileLocalPath: null,
    fileUrls: null,
    fileS3Urls: null,
    fileS3Keys: null,
    fileLocalPaths: null,
  };

  if (files && files.length) {
    const uploaded = await Promise.all(files.map((f) => uploadToS3(f)));

    const urls = uploaded.map(u => u.s3Url).filter((x): x is string => !!x);
    const keys = uploaded.map(u => u.key).filter((x): x is string => !!x);
    const locals = isDev
      ? uploaded.map(u => u.localPath).filter((x): x is string => !!x)
      : null;

    fileData = {
      ...fileData,
      fileUrls: urls.length ? urls : null,
      fileS3Urls: urls.length ? urls : null,
      fileS3Keys: keys.length ? keys : null,
      fileLocalPaths: locals && locals.length ? locals : null,
    };

    if (uploaded[0]) {
      fileData.fileUrl = uploaded[0].s3Url ?? null;
      fileData.fileS3Url = uploaded[0].s3Url ?? null;
      fileData.fileS3Key = uploaded[0].key ?? null;
      fileData.fileLocalPath = isDev ? uploaded[0].localPath ?? null : null;
    }
  }

  const newClaim = new Claim({
    name: data.name,
    description: data.description,
    policy: data.policy,
    summary,
    ...fileData,
  });

  return newClaim.save();
}

export async function updateClaim(
  id: string,
  payload: UpdateClaimInput,
  files?: Express.Multer.File[]
) {
  const claim = await Claim.findById(id);
  if (!claim) return null;

  const updateData: UpdateClaimInput = { ...payload };

  if (files && files.length) {
    const oldKeys: string[] = [];
    if (claim.fileS3Key) oldKeys.push(claim.fileS3Key);
    if (Array.isArray((claim as any).fileS3Keys)) {
      oldKeys.push(...((claim as any).fileS3Keys as string[]));
    }
    await Promise.all(
      oldKeys.map(async (k) => {
        try {
          await deleteFromS3(k);
        } catch (e) {
          console.error("S3 delete error:", e);
        }
      })
    );

    const uploaded = await Promise.all(files.map((f) => uploadToS3(f)));

    const urls = uploaded.map(u => u.s3Url).filter((x): x is string => !!x);
    const keys = uploaded.map(u => u.key).filter((x): x is string => !!x);
    const locals = isDev
      ? uploaded.map(u => u.localPath).filter((x): x is string => !!x)
      : null;

    updateData.fileUrl = uploaded[0]?.s3Url ?? null;
    updateData.fileS3Url = uploaded[0]?.s3Url ?? null;
    updateData.fileS3Key = uploaded[0]?.key ?? null;
    updateData.fileLocalPath = isDev ? uploaded[0]?.localPath ?? null : null;

    updateData.fileUrls = urls.length ? urls : null;
    updateData.fileS3Urls = urls.length ? urls : null;
    updateData.fileS3Keys = keys.length ? keys : null;
    updateData.fileLocalPaths = locals && locals.length ? locals : null;
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

  const keysToDelete: string[] = [];
  if (claim.fileS3Key) keysToDelete.push(claim.fileS3Key);
  if ((claim as any).fileS3Keys && Array.isArray((claim as any).fileS3Keys)) {
    keysToDelete.push(...((claim as any).fileS3Keys as string[]));
  }

  await Promise.all(
    keysToDelete.map(async (k) => {
      try {
        await deleteFromS3(k);
      } catch (e) {
        console.error("S3 delete error:", e);
      }
    })
  );

  if (isDev) {
    const locals: string[] = [];
    if (claim.fileLocalPath) locals.push(claim.fileLocalPath);
    const more = (claim as any).fileLocalPaths as string[] | undefined;
    if (Array.isArray(more)) locals.push(...more);

    for (const rel of locals) {
      try {
        const full = path.join(process.cwd(), rel);
        if (fs.existsSync(full)) fs.unlinkSync(full);
      } catch (e) {
        console.error("Local delete error:", e);
      }
    }
  }

  await Claim.findByIdAndDelete(id);
  return claim;
}
