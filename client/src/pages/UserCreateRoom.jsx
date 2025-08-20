import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Save, 
  Layout, 
  Home, 
  Plus,
  Ruler,
  Eye,
  Users
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { roomAPI } from '@/lib/api';

const UserCreateRoom = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    room: {
      width: 10,
      depth: 10,
      height: 3,
      wallColor: '#ffffff',
      floorColor: '#8b7355',
      ceilingColor: '#ffffff'
    },
    isPublic: false
  });

  const handleChange = (field, value) => {
    if (field.startsWith('room.')) {
      const roomField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        room: {
          ...prev.room,
          [roomField]: roomField.includes('Color') ? value : Number(value)
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Please enter a room name');
      return;
    }

    try {
      setLoading(true);
      
      const roomData = {
        ...formData,
        furniture: [], // Start with empty furniture array
        createdBy: user.id
      };

      const response = await roomAPI.create(roomData);
      
      // Navigate to edit page to add furniture
      navigate(`/edit-room/${response.data.data._id}`);
    } catch (error) {
      console.error('Failed to create room:', error);
      alert('Failed to create room. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Button variant="ghost" asChild className="mr-4">
                <Link to="/my-designs">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to My Designs
                </Link>
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Layout className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  RoomCraft
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" asChild>
                <Link to="/my-designs">
                  <Home className="w-4 h-4 mr-2" />
                  My Designs
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Plus className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create New Room
            </h1>
            <p className="text-gray-600 max-w-md mx-auto">
              Design your perfect space by setting up the room dimensions and basic details
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <Layout className="w-5 h-5 mr-2 text-blue-600" />
                    Room Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name" className="text-sm font-medium">Room Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleChange('name', e.target.value)}
                          placeholder="Enter room name"
                          className="mt-1"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="description" className="text-sm font-medium">Description (Optional)</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => handleChange('description', e.target.value)}
                          placeholder="Describe your room design..."
                          rows={3}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    {/* Room Dimensions */}
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <Ruler className="w-5 h-5 mr-2 text-blue-600" />
                        <h3 className="text-lg font-medium">Room Dimensions</h3>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="width" className="text-sm font-medium">Width (units)</Label>
                          <Input
                            id="width"
                            type="number"
                            min="1"
                            max="50"
                            value={formData.room.width}
                            onChange={(e) => handleChange('room.width', e.target.value)}
                            className="mt-1"
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="depth" className="text-sm font-medium">Depth (units)</Label>
                          <Input
                            id="depth"
                            type="number"
                            min="1"
                            max="50"
                            value={formData.room.depth}
                            onChange={(e) => handleChange('room.depth', e.target.value)}
                            className="mt-1"
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="height" className="text-sm font-medium">Height (units)</Label>
                          <Input
                            id="height"
                            type="number"
                            min="2"
                            max="10"
                            value={formData.room.height}
                            onChange={(e) => handleChange('room.height', e.target.value)}
                            className="mt-1"
                            required
                          />
                        </div>
                      </div>

                      <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                        <strong>Preview:</strong> {formData.room.width} × {formData.room.depth} × {formData.room.height} units
                      </div>
                    </div>

                                         {/* Room Colors */}
                     <div className="space-y-4">
                       <div className="flex items-center">
                         <div className="w-5 h-5 mr-2 bg-gradient-to-r from-red-400 to-pink-400 rounded"></div>
                         <h3 className="text-lg font-medium">Room Colors</h3>
                       </div>
                       
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <div>
                           <Label htmlFor="wallColor" className="text-sm font-medium">Wall Color</Label>
                           <div className="flex items-center mt-1">
                             <Input
                               id="wallColor"
                               type="color"
                               value={formData.room.wallColor}
                               onChange={(e) => handleChange('room.wallColor', e.target.value)}
                               className="w-12 h-10 p-1 border rounded mr-2"
                             />
                             <Input
                               type="text"
                               value={formData.room.wallColor}
                               onChange={(e) => handleChange('room.wallColor', e.target.value)}
                               placeholder="#ffffff"
                               className="flex-1"
                             />
                           </div>
                         </div>

                         <div>
                           <Label htmlFor="floorColor" className="text-sm font-medium">Floor Color</Label>
                           <div className="flex items-center mt-1">
                             <Input
                               id="floorColor"
                               type="color"
                               value={formData.room.floorColor}
                               onChange={(e) => handleChange('room.floorColor', e.target.value)}
                               className="w-12 h-10 p-1 border rounded mr-2"
                             />
                             <Input
                               type="text"
                               value={formData.room.floorColor}
                               onChange={(e) => handleChange('room.floorColor', e.target.value)}
                               placeholder="#8b7355"
                               className="flex-1"
                             />
                           </div>
                         </div>

                         <div>
                           <Label htmlFor="ceilingColor" className="text-sm font-medium">Ceiling Color</Label>
                           <div className="flex items-center mt-1">
                             <Input
                               id="ceilingColor"
                               type="color"
                               value={formData.room.ceilingColor}
                               onChange={(e) => handleChange('room.ceilingColor', e.target.value)}
                               className="w-12 h-10 p-1 border rounded mr-2"
                             />
                             <Input
                               type="text"
                               value={formData.room.ceilingColor}
                               onChange={(e) => handleChange('room.ceilingColor', e.target.value)}
                               placeholder="#ffffff"
                               className="flex-1"
                             />
                           </div>
                         </div>
                       </div>

                       <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                         <strong>Color Preview:</strong> You can adjust these colors later in the room editor
                       </div>
                     </div>

                     {/* Privacy Settings */}
                     <div className="space-y-4">
                       <div className="flex items-center">
                         <Eye className="w-5 h-5 mr-2 text-blue-600" />
                         <h3 className="text-lg font-medium">Privacy Settings</h3>
                       </div>
                       
                       <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                         <div>
                           <Label htmlFor="isPublic" className="text-sm font-medium">Make room public</Label>
                           <p className="text-sm text-gray-600 mt-1">
                             Public rooms can be viewed by anyone with the link
                           </p>
                         </div>
                         <Switch
                           id="isPublic"
                           checked={formData.isPublic}
                           onCheckedChange={(checked) => handleChange('isPublic', checked)}
                         />
                       </div>
                     </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-6 border-t border-gray-200">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/my-designs')}
                        disabled={loading}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {loading ? 'Creating...' : 'Create Room'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* What's Next Card */}
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Plus className="w-5 h-5 mr-2 text-green-600" />
                    What's Next?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    After creating your room, you'll be able to:
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-sm text-gray-600">Browse and add furniture uploaded by admins</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-sm text-gray-600">Position and rotate furniture in your room</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-sm text-gray-600">Switch between 2D and 3D views</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-sm text-gray-600">Share your room design with others</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Tips Card */}
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Users className="w-5 h-5 mr-2 text-purple-600" />
                    Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm text-gray-600">
                    <p>• Start with standard room dimensions (10×10×3)</p>
                    <p>• You can always adjust furniture placement later</p>
                    <p>• Use 2D view for precise positioning</p>
                    <p>• 3D view for realistic visualization</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserCreateRoom;
