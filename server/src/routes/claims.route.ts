import express, { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Claim from '../models/claims.model';
import { generateSummary } from '../services/aiService';
import { uploadToS3, deleteFromS3, getSignedUrl } from '../services/s3Service';

const router: Router = express.Router();


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'temp-uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and PDFs are allowed'));
    }
  }
});


router.get('/', async (req: Request, res: Response) => {
  try {
    const claims = await Claim.find().sort({ createdAt: -1 });
    

    const claimsWithUrls = await Promise.all(
      claims.map(async (claim) => {
        const claimObj = claim.toObject();
        

        if (claim.fileS3Key && process.env.USE_SIGNED_URLS === 'true') {
          claimObj.fileUrl = await getSignedUrl(claim.fileS3Key);
        }
        
        return claimObj;
      })
    );
    
    res.json(claimsWithUrls);
  } catch (error) {
    console.error('Error fetching claims:', error);
    res.status(500).json({ error: 'Failed to fetch claims' });
  }
});


router.get('/:id', async (req: Request, res: Response) => {
  try {
    const claim = await Claim.findById(req.params.id);
    if (!claim) {
      return res.status(404).json({ error: 'Claim not found' });
    }
    
    const claimObj = claim.toObject();
    

    if (claim.fileS3Key && process.env.USE_SIGNED_URLS === 'true') {
      claimObj.fileUrl = await getSignedUrl(claim.fileS3Key);
    }
    
    res.json(claimObj);
  } catch (error) {
    console.error('Error fetching claim:', error);
    res.status(500).json({ error: 'Failed to fetch claim' });
  }
});


router.post('/', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const { name, policyId, description } = req.body;
    const isDev = process.env.NODE_ENV === 'development';
    

    const summary = await generateSummary(description);
    
    let fileData = {
      fileUrl: null as string | null,
      fileS3Url: null as string | null,
      fileS3Key: null as string | null,
      fileLocalPath: null as string | null,
    };
    

    if (req.file) {
      try {
        const uploadResult = await uploadToS3(req.file);
        
        fileData = {
          fileUrl: uploadResult.s3Url, // Primary URL is always S3
          fileS3Url: uploadResult.s3Url,
          fileS3Key: uploadResult.key,
          fileLocalPath: isDev ? uploadResult.localPath || null : null,
        };
      } catch (uploadError) {
        console.error('S3 upload error:', uploadError);
        return res.status(500).json({ error: 'Failed to upload file to S3' });
      }
    }
    

    const newClaim = new Claim({
      name,
      policyId,
      description,
      summary,
      ...fileData
    });
    
    const savedClaim = await newClaim.save();
    res.status(201).json(savedClaim);
  } catch (error) {
    console.error('Error creating claim:', error);
    res.status(500).json({ error: 'Failed to create claim' });
  }
});


router.put('/:id', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const claim = await Claim.findById(req.params.id);
    if (!claim) {
      return res.status(404).json({ error: 'Claim not found' });
    }
    
    const updateData = { ...req.body };
    const isDev = process.env.NODE_ENV === 'development';
    

    if (req.file) {

      if (claim.fileS3Key) {
        try {
          await deleteFromS3(claim.fileS3Key);
        } catch (error) {
          console.error('Error deleting old file from S3:', error);
        }
      }
      

      const uploadResult = await uploadToS3(req.file);
      
      updateData.fileUrl = uploadResult.s3Url;
      updateData.fileS3Url = uploadResult.s3Url;
      updateData.fileS3Key = uploadResult.key;
      updateData.fileLocalPath = isDev ? uploadResult.localPath || null : null;
    }
    
    const updatedClaim = await Claim.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.json(updatedClaim);
  } catch (error) {
    console.error('Error updating claim:', error);
    res.status(500).json({ error: 'Failed to update claim' });
  }
});


router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const claim = await Claim.findById(req.params.id);
    
    if (!claim) {
      return res.status(404).json({ error: 'Claim not found' });
    }
    

    if (claim.fileS3Key) {
      try {
        await deleteFromS3(claim.fileS3Key);
      } catch (error) {
        console.error('Error deleting file from S3:', error);
      }
    }
    

    if (claim.fileLocalPath && process.env.NODE_ENV === 'development') {
      const localPath = path.join(process.cwd(), claim.fileLocalPath);
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
      }
    }
    
    await Claim.findByIdAndDelete(req.params.id);
    res.json({ message: 'Claim and associated files deleted successfully' });
  } catch (error) {
    console.error('Error deleting claim:', error);
    res.status(500).json({ error: 'Failed to delete claim' });
  }
});


if (process.env.NODE_ENV === 'development') {
  router.use('/uploads', express.static('uploads'));
}

export default router;