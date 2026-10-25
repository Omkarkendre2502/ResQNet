import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../uploads');

// Safe storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const randomHex = crypto.randomBytes(16).toString('hex');
    const safeFilename = `${Date.now()}-${randomHex}${ext}`;
    cb(null, safeFilename);
  }
});

// File filter for image/jpeg, image/png, image/webp
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    const error = new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
    error.code = 'INVALID_FILE_TYPE';
    cb(error, false);
  }
};

const multerInstance = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2 MB max
  },
  fileFilter
});

/**
 * Middleware wrapper to catch multer errors (e.g. file too large or wrong type)
 * and return 400 with a clean message.
 */
export const handlePhotoUpload = (req, res, next) => {
  const uploadSingle = multerInstance.single('photo');

  uploadSingle(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          error: 'File too large. Maximum photo upload size is 2 MB.'
        });
      }
      if (err.code === 'INVALID_FILE_TYPE' || err.message) {
        return res.status(400).json({
          error: err.message || 'Invalid file uploaded.'
        });
      }
      return res.status(400).json({
        error: 'Error processing uploaded file.'
      });
    }
    next();
  });
};

export default handlePhotoUpload;
