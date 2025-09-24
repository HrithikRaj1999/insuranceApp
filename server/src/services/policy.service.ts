import { FilterQuery, UpdateQuery } from "mongoose";
import PolicyModel, { IPolicy } from "../models/policy.model";

export type CreatePolicyInput = {
  policyNumber: string;
  holderName: string;
  type: "Health" | "Auto" | "Life" | "Travel";
  premiumAmount: number;
  startDate: Date | string;
  endDate: Date | string;
  status?: "active" | "expired" | "pending";
  coverageDetails: string;
};

export type UpdatePolicyInput = Partial<CreatePolicyInput>;

export type ListPoliciesQuery = {
  q?: string; // search (policyNumber / holderName)
  type?: "Health" | "Auto" | "Life" | "Travel";
  status?: "active" | "expired" | "pending";
  page?: number | string; // 1-based
  limit?: number | string; // page size
  sort?: string; // e.g. "-createdAt" or "holderName"
};

export class PolicyService {
  static async getByNumber(policyNumber: string) {
    return PolicyModel.findOne({ policyNumber });
  }

  static async existsByNumber(policyNumber: string) {
    const doc = await PolicyModel.exists({ policyNumber });
    return !!doc;
  }
  static async create(input: CreatePolicyInput): Promise<IPolicy> {
    // enforce unique policyNumber
    const exists = await PolicyModel.findOne({
      policyNumber: input.policyNumber,
    });
    if (exists) throw new Error("POLICY_NUMBER_ALREADY_EXISTS");
    return PolicyModel.create(input);
  }

  static async getById(id: string): Promise<IPolicy | null> {
    return PolicyModel.findById(id);
  }

  static async list(query: ListPoliciesQuery) {
    const {
      q,
      type,
      status,
      page = 1,
      limit = 20,
      sort = "-createdAt",
    } = query;

    const filter: FilterQuery<IPolicy> = {};
    if (q) {
      filter.$or = [
        { policyNumber: { $regex: q, $options: "i" } },
        { holderName: { $regex: q, $options: "i" } },
      ];
    }
    if (type) filter.type = type;
    if (status) filter.status = status;

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      PolicyModel.find(filter).sort(sort).skip(skip).limit(limitNum),
      PolicyModel.countDocuments(filter),
    ]);

    return {
      items,
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    };
  }

  static async update(
    id: string,
    input: UpdatePolicyInput
  ): Promise<IPolicy | null> {
    // if policyNumber changes, enforce uniqueness
    if (input.policyNumber) {
      const exists = await PolicyModel.findOne({
        policyNumber: input.policyNumber,
        _id: { $ne: id },
      });
      if (exists) throw new Error("POLICY_NUMBER_ALREADY_EXISTS");
    }
    const update: UpdateQuery<IPolicy> = { $set: input };
    return PolicyModel.findByIdAndUpdate(id, update, { new: true });
  }

  static async remove(id: string): Promise<void> {
    await PolicyModel.findByIdAndDelete(id);
  }
}
