import { Request, Response } from "express";
import {
  listClaims,
  getClaimById,
  createClaim,
  updateClaim,
  deleteClaim,
} from "../services/claim.service";
import { getSignedUrl } from "../services/s3Service";
import policyModel from "../models/policy.model";
import { Types } from "mongoose";
const errMsg = (e: unknown, fallback = "Internal server error") =>
  e instanceof Error ? e.message : fallback;
const useSigned = process.env.USE_SIGNED_URLS === "true";
export async function getAllClaims(req: Request, res: Response) {
  try {
    const claims = await listClaims();
    const claimsWithUrls = await Promise.all(
      claims.map(async (claim) => {
        const obj = claim.toObject() as any;
        if (useSigned) {
          if (obj.fileS3Key) {
            obj.fileUrl = await getSignedUrl(obj.fileS3Key);
          }
          if (Array.isArray(obj.fileS3Keys) && obj.fileS3Keys.length) {
            obj.fileUrls = await Promise.all(
              obj.fileS3Keys.map((k: string) => getSignedUrl(k))
            );
          }
        }
        return obj;
      })
    );
    res.json(claimsWithUrls);
  } catch (e) {
    console.error("Error fetching claims:", e);
    res.status(500).json({
      error: "Failed to fetch claims",
    });
  }
}

export async function getClaim(req: Request, res: Response) {
  try {
    const claim = await getClaimById(req.params.id);
    if (!claim) {
      return res.status(404).json({
        error: "Claim not found",
      });
    }

    const obj = claim.toObject() as any;

    const isDevelopment = process.env.NODE_ENV === "development";

    if (isDevelopment) {
      if (obj.fileLocalPaths && obj.fileLocalPaths.length > 0) {
        const protocol = req.protocol;
        const host = req.get("host");
        obj.fileUrls = obj.fileLocalPaths.map((localPath: string) => {
          return `${protocol}://${host}${localPath}`;
        });
      }
    } else if (useSigned) {
      if (obj.fileS3Key) {
        obj.fileUrl = await getSignedUrl(obj.fileS3Key);
      }

      if (Array.isArray(obj.fileS3Keys) && obj.fileS3Keys.length) {
        obj.fileUrls = await Promise.all(
          obj.fileS3Keys.map((k: string) => getSignedUrl(k))
        );
      }
    }

    res.json(obj);
  } catch (e) {
    console.error("Error fetching claim:", e);
    res.status(500).json({
      error: "Failed to fetch claim",
    });
  }
}
export async function createClaimHandler(req: Request, res: Response) {
  try {
    const { name, policyId, description } = req.body as {
      name: string;
      policyId: string;
      description: string;
    };
    if (!name || !policyId || !description) {
      return res.status(400).json({
        message: "name, policyId and description are required",
      });
    }
    const policyDoc = await policyModel.findOne({
      policyNumber: policyId,
    });
    if (!policyDoc) {
      return res.status(400).json({
        message: "Invalid Policy ID. Policy not found.",
      });
    }
    const files = (req.files as Express.Multer.File[]) || [];
    const saved = await createClaim(
      {
        name,
        description,
        policy: policyDoc._id as Types.ObjectId,
      },
      files.length ? files.slice(0, 10) : undefined
    );
    return res.status(201).json(saved);
  } catch (e) {
    console.error("Error creating claim:", e);
    return res.status(500).json({
      message: errMsg(e),
    });
  }
}
export async function updateClaimHandler(req: Request, res: Response) {
  try {
    const files = (req.files as Express.Multer.File[]) || [];
    const updated = await updateClaim(
      req.params.id,
      {
        ...req.body,
      },
      files.length ? files.slice(0, 10) : undefined
    );
    if (!updated)
      return res.status(404).json({
        error: "Claim not found",
      });
    res.json(updated);
  } catch (e) {
    console.error("Error updating claim:", e);
    res.status(500).json({
      error: "Failed to update claim",
    });
  }
}
export async function deleteClaimHandler(req: Request, res: Response) {
  try {
    const deleted = await deleteClaim(req.params.id);
    if (!deleted)
      return res.status(404).json({
        error: "Claim not found",
      });
    res.json({
      message: "Claim and associated files deleted successfully",
    });
  } catch (e) {
    console.error("Error deleting claim:", e);
    res.status(500).json({
      error: "Failed to delete claim",
    });
  }
}
