import express from 'express';
import {
  uploadFurniture,
  getFurniture,
  getFurnitureById,
  updateFurniture,
  deleteFurniture
} from '../controllers/furnitureController.js';
import { auth, adminAuth } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Configure multer for furniture uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Public routes
router.get('/', getFurniture);
router.get('/:id', getFurnitureById);

// Admin routes - using any() to accept all fields
router.post('/upload', adminAuth, upload.any(), uploadFurniture);
router.put('/:id', adminAuth, updateFurniture);
router.delete('/:id', adminAuth, deleteFurniture);

export default router;
