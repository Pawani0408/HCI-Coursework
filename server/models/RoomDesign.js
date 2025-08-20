import mongoose from 'mongoose';

const roomDesignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  room: {
    width: {
      type: Number,
      required: true,
      default: 10
    },
    depth: {
      type: Number,
      required: true,
      default: 10
    },
    height: {
      type: Number,
      required: true,
      default: 3
    },
    wallColor: {
      type: String,
      default: '#ffffff'
    },
    floorColor: {
      type: String,
      default: '#8b7355'
    },
    ceilingColor: {
      type: String,
      default: '#ffffff'
    }
  },
  furniture: [{
    modelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FurnitureModel',
      required: true
    },
    position: {
      x: {
        type: Number,
        default: 0
      },
      y: {
        type: Number,
        default: 0
      },
      z: {
        type: Number,
        default: 0
      }
    },
    rotation: {
      x: {
        type: Number,
        default: 0
      },
      y: {
        type: Number,
        default: 0
      },
      z: {
        type: Number,
        default: 0
      }
    },
    scale: {
      type: Number,
      default: 1
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('RoomDesign', roomDesignSchema);
