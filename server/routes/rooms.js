import express from 'express';
import {
  createRoomDesign,
  getRoomDesigns,
  getRoomDesignById,
  updateRoomDesign,
  deleteRoomDesign,
  getPublicRoomDesign
} from '../controllers/roomController.js';
import { auth, adminAuth } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/public/:id', getPublicRoomDesign);

// Protected routes (authenticated users can create/manage rooms)
router.get('/', auth, getRoomDesigns);
router.get('/:id', auth, getRoomDesignById);
router.post('/', auth, createRoomDesign); // Users can create rooms
router.put('/:id', auth, updateRoomDesign); // Users can update their own rooms
router.delete('/:id', auth, deleteRoomDesign); // Users can delete their own rooms

export default router;
