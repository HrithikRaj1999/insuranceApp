import { Request, Response } from "express";
import {
  PolicyService,
  CreatePolicyInput,
  UpdatePolicyInput,
} from "../services/policy.service";

export const createPolicy = async (req: Request, res: Response) => {
  try {
    const body = req.body as CreatePolicyInput;
    const doc = await PolicyService.create(body);
    return res.status(201).json(doc);
  } catch (err: any) {
    if (err?.message === "POLICY_NUMBER_ALREADY_EXISTS") {
      return res.status(409).json({ message: "Policy number already exists" });
    }
    return res.status(500).json({ message: "Failed to create policy" });
  }
};

export const getPolicy = async (req: Request, res: Response) => {
  try {
    const doc = await PolicyService.getById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Policy not found" });
    return res.json(doc);
  } catch {
    return res.status(500).json({ message: "Failed to fetch policy" });
  }
};
export const policyExists = async (req: Request, res: Response) => {
  try {
    const policyNumber = String(req.query.policyNumber || "").trim();
    if (!policyNumber)
      return res
        .status(400)
        .json({ exists: false, message: "policyNumber is required" });
    const exists = await PolicyService.existsByNumber(policyNumber);
    return res.json({ exists });
  } catch {
    return res
      .status(500)
      .json({ message: "Failed to check policy existence" });
  }
};
export const listPolicies = async (req: Request, res: Response) => {
  try {
    const data = await PolicyService.list(req.query as any);
    return res.json(data);
  } catch {
    return res.status(500).json({ message: "Failed to list policies" });
  }
};

export const updatePolicy = async (req: Request, res: Response) => {
  try {
    const body = req.body as UpdatePolicyInput;
    const doc = await PolicyService.update(req.params.id, body);
    if (!doc) return res.status(404).json({ message: "Policy not found" });
    return res.json(doc);
  } catch (err: any) {
    if (err?.message === "POLICY_NUMBER_ALREADY_EXISTS") {
      return res.status(409).json({ message: "Policy number already exists" });
    }
    return res.status(500).json({ message: "Failed to update policy" });
  }
};

export const deletePolicy = async (req: Request, res: Response) => {
  try {
    await PolicyService.remove(req.params.id);
    return res.status(204).send();
  } catch {
    return res.status(500).json({ message: "Failed to delete policy" });
  }
};
