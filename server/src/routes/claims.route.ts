import express from 'express';
import multer from 'multer';
import Claim from '../models/claims.model';
import { generateSummary } from '../services/aiService';
import { uploadToS3 } from '../services/s3Service';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.get('/', async (req, res) => {
  const claims = await Claim.find().sort('-createdAt');
  res.json(claims);
});

router.get('/:id', async (req, res) => {
  const claim = await Claim.findById(req.params.id);
  res.json(claim);
});

router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { name, policyId, description } = req.body;
    
    let fileUrl = '';
    if (req.file) {
      fileUrl = await uploadToS3(req.file);
    }
    
    const summary = await generateSummary(description);
    
    const claim = new Claim({
      name,
      policyId,
      description,
      fileUrl,
      summary
    });
    
    await claim.save();
    res.json(claim);
  } catch (error) {
    res.status(500).json({ error: 'Failed to process claim' });
  }
});

router.put('/:id', async (req, res) => {
  const claim = await Claim.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(claim);
});

router.delete('/:id', async (req, res) => {
  await Claim.findByIdAndDelete(req.params.id);
  res.json({ message: 'Claim deleted' });
});

export default router;