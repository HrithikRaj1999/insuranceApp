import multer from "multer";
import path from "path";
import fs from "fs";
const uploadRoot = path.resolve(process.cwd(), "temp-uploads");
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    if (!fs.existsSync(uploadRoot)) fs.mkdirSync(uploadRoot, {
      recursive: true
    });
    cb(null, uploadRoot);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  }
});
const allowedTypes = /jpeg|jpg|png|pdf/;
export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  fileFilter: (_req, file, cb) => {
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) cb(null, true);else cb(new Error("Only images and PDFs are allowed"));
  }
});