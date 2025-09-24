import { Request, Response } from 'express';
import { listClaims, getClaimById, createClaim, updateClaim, deleteClaim } from '../services/claim.service';
import { getSignedUrl } from '../services/s3Service';

const useSigned = process.env.USE_SIGNED_URLS === 'true';

export async function getAllClaims(req: Request, res: Response) {
  try {
    const claims = await listClaims();

    const claimsWithUrls = await Promise.all(
      claims.map(async (claim) => {
        const obj = claim.toObject();
        if (obj.fileS3Key && useSigned) {
          obj.fileUrl = await getSignedUrl(obj.fileS3Key);
        }
        return obj;
      })
    );

    res.json(claimsWithUrls);
  } catch (e) {
    console.error('Error fetching claims:', e);
    res.status(500).json({ error: 'Failed to fetch claims' });
  }
}

export async function getClaim(req: Request, res: Response) {
  try {
    const claim = await getClaimById(req.params.id);
    if (!claim) return res.status(404).json({ error: 'Claim not found' });

    const obj = claim.toObject();
    if (obj.fileS3Key && useSigned) {
      obj.fileUrl = await getSignedUrl(obj.fileS3Key);
    }

    res.json(obj);
  } catch (e) {
    console.error('Error fetching claim:', e);
    res.status(500).json({ error: 'Failed to fetch claim' });
  }
}

export async function createClaimHandler(req: Request, res: Response) {
  try {
    const { name, policyId, description } = req.body;
    const saved = await createClaim({ name, policyId, description }, req.file || undefined);
    res.status(201).json(saved);
  } catch (e) {
    console.error('Error creating claim:', e);
    res.status(500).json({ error: 'Failed to create claim' });
  }
}

export async function updateClaimHandler(req: Request, res: Response) {
  try {
    const updated = await updateClaim(req.params.id, { ...req.body }, req.file || undefined);
    if (!updated) return res.status(404).json({ error: 'Claim not found' });
    res.json(updated);
  } catch (e) {
    console.error('Error updating claim:', e);
    res.status(500).json({ error: 'Failed to update claim' });
  }
}

export async function deleteClaimHandler(req: Request, res: Response) {
  try {
    const deleted = await deleteClaim(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Claim not found' });
    res.json({ message: 'Claim and associated files deleted successfully' });
  } catch (e) {
    console.error('Error deleting claim:', e);
    res.status(500).json({ error: 'Failed to delete claim' });
  }
}
