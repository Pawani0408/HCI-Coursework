import FurnitureModel from '../models/FurnitureModel.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadFurniture = async (req, res) => {
  try {

    // Find the furniture file and thumbnail file from the files array
    const furnitureFile = req.files.find(file => file.fieldname === 'furnitureFile');
    const thumbnailFile = req.files.find(file => file.fieldname === 'thumbnailFile');

    console.log('Found furniture file:', furnitureFile);
    console.log('Found thumbnail file:', thumbnailFile);

    if (!furnitureFile) {
      return res.status(400).json({ message: 'No 3D model file uploaded' });
    }

    // Validate file types
    const allowedExtensions = ['.glb', '.gltf', '.obj'];
    const fileExtension = path.extname(furnitureFile.originalname).toLowerCase();

    console.log('File extension:', fileExtension);
    console.log('Allowed extensions:', allowedExtensions);

    if (!allowedExtensions.includes(fileExtension)) {
      return res.status(400).json({
        message: 'Invalid file type. Only .glb, .gltf, and .obj files are allowed.'
      });
    }

    // Validate thumbnail if provided
    if (thumbnailFile && !thumbnailFile.mimetype.startsWith('image/')) {
      return res.status(400).json({
        message: 'Invalid thumbnail file. Only image files are allowed.'
      });
    }

    const {
      name,
      description,
      category,
      price,
      tags,
      width,
      depth,
      height
    } = req.body;

    console.log('Creating furniture model with data:', {
      name, description, category, price, tags, width, depth, height
    });

    const furnitureModel = new FurnitureModel({
      name,
      description: description || '',
      category: category || 'other',
      price: parseFloat(price) || 0,
      fileUrl: `/uploads/${furnitureFile.filename}`,
      thumbnailUrl: thumbnailFile ? `/uploads/${thumbnailFile.filename}` : null,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      size: {
        width: parseFloat(width) || 1,
        depth: parseFloat(depth) || 1,
        height: parseFloat(height) || 1
      },
      createdBy: req.user._id
    });

    await furnitureModel.save();
    console.log('Furniture model saved successfully:', furnitureModel._id);

    res.status(201).json({
      message: 'Furniture model uploaded successfully',
      data: furnitureModel
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getFurniture = async (req, res) => {
  try {
    const furniture = await FurnitureModel.find()
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });

    res.json({ data: furniture });
  } catch (error) {
    console.error('Get furniture error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getFurnitureById = async (req, res) => {
  try {
    const furniture = await FurnitureModel.findById(req.params.id)
      .populate('createdBy', 'username');

    if (!furniture) {
      return res.status(404).json({ message: 'Furniture not found' });
    }

    res.json(furniture);
  } catch (error) {
    console.error('Get furniture by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateFurniture = async (req, res) => {
  try {
    const { name, tags, width, depth, height } = req.body;
    
    const updateData = {
      name,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      size: {
        width: parseFloat(width) || 1,
        depth: parseFloat(depth) || 1,
        height: parseFloat(height) || 1
      }
    };

    const furniture = await FurnitureModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('createdBy', 'username');

    if (!furniture) {
      return res.status(404).json({ message: 'Furniture not found' });
    }

    res.json({
      message: 'Furniture updated successfully',
      furniture
    });
  } catch (error) {
    console.error('Update furniture error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteFurniture = async (req, res) => {
  try {
    const furniture = await FurnitureModel.findByIdAndDelete(req.params.id);

    if (!furniture) {
      return res.status(404).json({ message: 'Furniture not found' });
    }

    res.json({ message: 'Furniture deleted successfully' });
  } catch (error) {
    console.error('Delete furniture error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
