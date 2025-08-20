import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Save, Eye, Plus, Trash2, LayoutGrid, Box } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRoomStore } from '@/store/roomStore';
import { useFurnitureStore } from '@/store/furnitureStore';
import { roomAPI, furnitureAPI } from '@/lib/api';
import Scene3D from '@/components/Scene3D';
import Editor2D from '@/components/Editor2D';

const UserEditRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentRoom, setRoom } = useRoomStore();
  const { setFurniture } = useFurnitureStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [availableFurniture, setAvailableFurniture] = useState([]);
  const [view, setView] = useState('3d');

  useEffect(() => {
    loadRoomData();
    loadAvailableFurniture();
  }, [id]);

  const loadRoomData = async () => {
    if (!id) {
      console.error('Room ID is undefined');
      alert('Invalid room ID');
      navigate('/my-designs');
      return;
    }

    try {
      setLoading(true);
      const response = await roomAPI.getById(id);
      const room = response.data.data;
      
      // Check if user owns this room
      if (room.createdBy._id !== user.id) {
        alert('You can only edit your own rooms');
        navigate('/my-designs');
        return;
      }
      
      setRoom(room);
    } catch (error) {
      console.error('Failed to load room:', error);
      alert('Failed to load room data');
      navigate('/my-designs');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableFurniture = async () => {
    try {
      const response = await furnitureAPI.getAll();
      const furnitureData = response.data.data || [];
      setAvailableFurniture(furnitureData);
      setFurniture(furnitureData); // Populate the furniture store
    } catch (error) {
      console.error('Failed to load furniture:', error);
    }
  };

  const handleSaveRoom = async () => {
    if (!currentRoom) return;

    try {
      setSaving(true);
      
      // Prepare furniture data for backend (only model IDs and transforms)
      const furnitureData = currentRoom.furniture.map(f => ({
        modelId: f.modelId,
        position: f.position,
        rotation: f.rotation,
        scale: f.scale.x // Backend expects a number, not an object
      }));

      const roomData = {
        name: currentRoom.name,
        description: currentRoom.description,
        room: currentRoom.room,
        furniture: furnitureData,
        isPublic: currentRoom.isPublic
      };

      await roomAPI.update(id, roomData);
      alert('Room saved successfully!');
    } catch (error) {
      console.error('Failed to save room:', error);
      alert('Failed to save room. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading room...</div>
      </div>
    );
  }

  if (!currentRoom) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Room not found</div>
      </div>
    );
  }

  const handleAddFurniture = (furnitureItem) => {
    // Calculate initial position based on furniture size
    const height = furnitureItem.size?.height || 1;
    const initialY = height / 2; // Position furniture so it sits on the grid floor
    
    const newFurnitureInstance = {
      id: Date.now(), // Temporary ID
      modelId: furnitureItem._id,
      modelData: furnitureItem, // Store the full furniture data for display
      position: { x: 0, y: 0, z: 0 }, // Position furniture at grid floor level
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 }
    };
    


    const updatedRoom = {
      ...currentRoom,
      furniture: [...currentRoom.furniture, newFurnitureInstance]
    };
    
    setRoom(updatedRoom);
  };

  const handleRemoveFurniture = (furnitureId) => {
    const updatedRoom = {
      ...currentRoom,
      furniture: currentRoom.furniture.filter(f => f.id !== furnitureId)
    };
    
    setRoom(updatedRoom);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-200">
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/my-designs')}
                  className="mr-4 hover:bg-gray-100"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Designs
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {currentRoom.name}
                  </h1>
                  <p className="text-sm text-gray-600">3D Room Editor</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Tabs value={view} onValueChange={setView}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="3d" className="flex items-center gap-2">
                      <Box className="w-4 h-4" />
                      3D View
                    </TabsTrigger>
                    <TabsTrigger value="2d" className="flex items-center gap-2">
                      <LayoutGrid className="w-4 h-4" />
                      2D View
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/viewer/${id}`)}
                  className="border-gray-300"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button 
                  onClick={handleSaveRoom} 
                  disabled={saving}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Design'}
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Layout: 75% 3D View + 25% Sidebar */}
        <div className="flex h-[calc(100vh-88px)]">
          {/* 3D/2D View Area - 75% */}
          <div className="flex-1 w-3/4 p-4">
            <div className="h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <Tabs value={view} onValueChange={setView} className="h-full flex flex-col">
                <TabsContent value="3d" className="flex-1 m-0 p-0">
                  <div className="h-full relative">
                    <Scene3D />
                    {/* Floating Controls */}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-md">
                      <div className="text-sm font-medium text-gray-700 mb-2">Room Dimensions</div>
                      <div className="text-xs text-gray-600">
                        {currentRoom.room.width}m × {currentRoom.room.depth}m × {currentRoom.room.height}m
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="2d" className="flex-1 m-0 p-0">
                  <div className="h-full relative">
                    <Editor2D />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Furniture Sidebar - 25% */}
          <div className="w-1/4 min-w-[320px] bg-white border-l border-gray-200 flex flex-col">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Furniture Library</h2>
              <p className="text-sm text-gray-600">Drag items into your room</p>
            </div>

            {/* Available Furniture */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-3">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Available Furniture</h3>
                  {availableFurniture.map((furniture) => (
                    <Card 
                      key={furniture._id} 
                      className="cursor-pointer hover:shadow-md transition-all duration-200 border-gray-200 hover:border-blue-300"
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">{furniture.name}</h4>
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-xs text-gray-500 capitalize">
                                {furniture.category || 'Furniture'}
                              </p>
                              {furniture.price && (
                                <span className="text-xs font-medium text-green-600">
                                  ${furniture.price}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                              {furniture.size.width}×{furniture.size.depth}×{furniture.size.height}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleAddFurniture(furniture)}
                            className="ml-2 bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {availableFurniture.length === 0 && (
                    <div className="text-center py-8">
                      <Box className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">No furniture available</p>
                      <p className="text-gray-400 text-xs">Contact admin to add furniture</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Room Furniture */}
            {currentRoom.furniture.length > 0 && (
              <div className="border-t border-gray-200 bg-gray-50">
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    In Room ({currentRoom.furniture.length})
                  </h3>
                  <ScrollArea className="max-h-48">
                    <div className="space-y-2">
                      {currentRoom.furniture.map((furniture) => (
                        <Card key={furniture.id} className="border-blue-200 bg-blue-50">
                          <CardContent className="p-2">
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                  {furniture.modelData?.name || 'Furniture Item'}
                                </h4>
                                <p className="text-xs text-gray-600">
                                  {furniture.modelData?.category || 'Unknown'}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRemoveFurniture(furniture.id)}
                                className="ml-2"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default UserEditRoom;
