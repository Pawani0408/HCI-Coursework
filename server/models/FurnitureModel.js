import mongoose from 'mongoose';

const furnitureModelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  category: {
    type: String,
    required: true,
    enum: ['chair', 'table', 'sofa', 'bed', 'storage', 'lighting', 'decoration', 'other'],
    default: 'other'
  },
  price: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  fileUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String,
    default: null
  },
  tags: [{
    type: String,
    trim: true
  }],
  size: {
    width: {
      type: Number,
      required: true,
      default: 1
    },
    depth: {
      type: Number,
      required: true,
      default: 1
    },
    height: {
      type: Number,
      required: true,
      default: 1
    }
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model('FurnitureModel', furnitureModelSchema);
