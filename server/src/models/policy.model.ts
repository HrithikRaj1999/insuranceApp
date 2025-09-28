import mongoose, { Document, Schema } from "mongoose";
export interface IPolicy extends Document {
  policyNumber: string;
  holderName: string;
  type: string;
  premiumAmount: number;
  startDate: Date;
  endDate: Date;
  status: "active" | "expired" | "pending";
  coverageDetails: string;
  createdAt: Date;
  updatedAt: Date;
}
const PolicySchema: Schema = new Schema({
  policyNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  holderName: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ["Health", "Auto", "Life", "Travel"]
  },
  premiumAmount: {
    type: Number,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ["active", "expired", "pending"],
    default: "active"
  },
  coverageDetails: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});
export default mongoose.model<IPolicy>("Policy", PolicySchema);