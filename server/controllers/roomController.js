import RoomDesign from '../models/RoomDesign.js';

export const createRoomDesign = async (req, res) => {
  try {
    const roomDesign = new RoomDesign({
      ...req.body,
      createdBy: req.user._id
    });

    await roomDesign.save();
    await roomDesign.populate('furniture.modelId createdBy', 'name fileUrl username');

    res.status(201).json({
      message: 'Room design created successfully',
      data: roomDesign
    });
  } catch (error) {
    console.error('Create room design error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getRoomDesigns = async (req, res) => {
  try {
    const query = req.user.role === 'admin' 
      ? {} 
      : { createdBy: req.user._id }; // Users should only see their own rooms

    const designs = await RoomDesign.find(query)
      .populate('furniture.modelId', 'name fileUrl size')
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });

    res.json({ data: designs });
  } catch (error) {
    console.error('Get room designs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getRoomDesignById = async (req, res) => {
  try {
    const design = await RoomDesign.findById(req.params.id)
      .populate('furniture.modelId', 'name fileUrl size tags')
      .populate('createdBy', 'username');

    if (!design) {
      return res.status(404).json({ message: 'Room design not found' });
    }

    // Check if user has access to this design
    if (!design.isPublic && req.user && design.createdBy._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    console.log('Retrieved room design:', {
      id: design._id,
      name: design.name,
      room: design.room,
      furnitureCount: design.furniture.length,
      furniture: design.furniture.map(f => ({
        modelId: f.modelId,
        modelName: f.modelId?.name || 'Unknown'
      }))
    });

    res.json({ data: design });
  } catch (error) {
    console.error('Get room design by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateRoomDesign = async (req, res) => {
  try {
    const design = await RoomDesign.findById(req.params.id);

    if (!design) {
      return res.status(404).json({ message: 'Room design not found' });
    }

    // Check if user owns this design or is admin
    if (design.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    console.log('Updating room design with data:', req.body);

    const updatedDesign = await RoomDesign.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('furniture.modelId', 'name fileUrl size tags')
     .populate('createdBy', 'username');

    console.log('Updated design:', updatedDesign);

    res.json({
      message: 'Room design updated successfully',
      design: updatedDesign
    });
  } catch (error) {
    console.error('Update room design error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteRoomDesign = async (req, res) => {
  try {
    const design = await RoomDesign.findById(req.params.id);

    if (!design) {
      return res.status(404).json({ message: 'Room design not found' });
    }

    // Check if user owns this design or is admin
    if (design.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await RoomDesign.findByIdAndDelete(req.params.id);

    res.json({ message: 'Room design deleted successfully' });
  } catch (error) {
    console.error('Delete room design error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getPublicRoomDesign = async (req, res) => {
  try {
    const design = await RoomDesign.findOne({ 
      _id: req.params.id, 
      isPublic: true 
    })
      .populate('furniture.modelId', 'name fileUrl size tags')
      .populate('createdBy', 'username');

    if (!design) {
      return res.status(404).json({ message: 'Public room design not found' });
    }

    res.json(design);
  } catch (error) {
    console.error('Get public room design error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
