import mongoose from 'mongoose';

const claimSchema = new mongoose.Schema({
  name: { type: String, required: true },
  policyId: { type: String, required: true },
  description: { type: String, required: true },
  fileUrl: String,
  summary: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Claim', claimSchema);