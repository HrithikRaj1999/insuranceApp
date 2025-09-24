import { Router } from "express";
import { upload } from "../middleware/upload.middleware";
import {
  createClaimHandler,
  deleteClaimHandler,
  getAllClaims,
  getClaim,
  updateClaimHandler,
} from "../controllers/claim.controller";

const router = Router();

router.get("/", getAllClaims);
router.get("/:id", getClaim);
router.post("/", upload.single("file"), createClaimHandler);
router.put("/:id", upload.single("file"), updateClaimHandler);
router.delete("/:id", deleteClaimHandler);

export default router;
