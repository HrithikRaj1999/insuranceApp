import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import claimRoutes from './routes/claims.route';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/claims');

app.use('/api/claims', claimRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});