import { Router } from "express";
import {
  createPolicy,
  getPolicy,
  listPolicies,
  updatePolicy,
  deletePolicy,
  policyExists,
} from "../controllers/policy.controller";

const router = Router();
router.get("/exists", policyExists);    
router.get("/", listPolicies);      // ?q=...&type=Auto&status=active&page=1&limit=20&sort=-createdAt
router.get("/:id", getPolicy);
router.post("/", createPolicy);
router.put("/:id", updatePolicy);
router.delete("/:id", deletePolicy);

export default router;
