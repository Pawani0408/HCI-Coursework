import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, Eye, Plus } from 'lucide-react';
import { useRoomStore } from '@/store/roomStore';
import { useFurnitureStore } from '@/store/furnitureStore';
import { roomAPI, furnitureAPI } from '@/lib/api';
import Scene3D from '@/components/Scene3D';
import Editor2D from '@/components/Editor2D';

const RoomEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  
  const {
    currentRoom,
    setRoom,
    updateRoomSettings,
    addFurniture,
    clearRoom,
    editorMode,
    setEditorMode
  } = useRoomStore();
  
  const { furniture, setFurniture } = useFurnitureStore();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [roomName, setRoomName] = useState('');

  useEffect(() => {
    loadData();
    return () => clearRoom();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load furniture list
      const furnitureRes = await furnitureAPI.getAll();
      const furnitureData = furnitureRes.data.data;
      console.log('Loaded furniture data:', furnitureData.map(f => ({ id: f._id, name: f.name })));
      setFurniture(furnitureData);
      
      // Load room design if editing
      if (isEdit) {
        const roomRes = await roomAPI.getById(id);
        const roomData = roomRes.data.data;
        
        // Ensure room colors are properly set with defaults
        const roomWithDefaults = {
          ...roomData,
          room: {
            width: roomData.room?.width || 10,
            depth: roomData.room?.depth || 10,
            height: roomData.room?.height || 3,
            wallColor: roomData.room?.wallColor || '#ffffff',
            floorColor: roomData.room?.floorColor || '#8b7355',
            ceilingColor: roomData.room?.ceilingColor || '#ffffff',
          }
        };
        
        console.log('Loaded room data:', roomWithDefaults);
        setRoom(roomWithDefaults);
        setRoomName(roomWithDefaults.name);
      } else {
        clearRoom();
        setRoomName('New Room Design');
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      alert('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Ensure room data has proper structure
      const roomData = {
        ...currentRoom,
        name: roomName,
        room: {
          width: currentRoom.room.width,
          depth: currentRoom.room.depth,
          height: currentRoom.room.height,
          wallColor: currentRoom.room.wallColor,
          floorColor: currentRoom.room.floorColor,
          ceilingColor: currentRoom.room.ceilingColor,
        }
      };

      console.log('Saving room data:', roomData);

      if (isEdit) {
        await roomAPI.update(id, roomData);
        alert('Room design updated successfully!');
      } else {
        const response = await roomAPI.create(roomData);
        alert('Room design created successfully!');
        navigate(`/admin/edit/${response.data.design._id}`);
      }
    } catch (error) {
      console.error('Save failed:', error);
      alert(error.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleAddFurniture = (furnitureItem) => {
    const newItem = {
      modelId: furnitureItem._id,
      position: { x: 0, y: 0, z: 0 }, // Y=0 is the floor surface
      rotation: { x: 0, y: 0, z: 0 },
      scale: 1
    };
    
    addFurniture(newItem);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate('/admin')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Input
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="text-xl font-bold border-none bg-transparent"
              placeholder="Room Name"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <Tabs value={editorMode} onValueChange={setEditorMode}>
              <TabsList>
                <TabsTrigger value="2d">2D View</TabsTrigger>
                <TabsTrigger value="3d">3D View</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Button
              variant="outline"
              onClick={() => navigate(`/viewer/${id}`)}
              disabled={!isEdit}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            
            <Button onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Room Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Room Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Width</label>
                    <Input
                      type="number"
                      value={currentRoom.room.width}
                      onChange={(e) => updateRoomSettings({ width: Number(e.target.value) })}
                      min="1"
                      max="50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Depth</label>
                    <Input
                      type="number"
                      value={currentRoom.room.depth}
                      onChange={(e) => updateRoomSettings({ depth: Number(e.target.value) })}
                      min="1"
                      max="50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Height</label>
                    <Input
                      type="number"
                      value={currentRoom.room.height}
                      onChange={(e) => updateRoomSettings({ height: Number(e.target.value) })}
                      min="1"
                      max="10"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Wall Color</label>
                  <Input
                    type="color"
                    value={currentRoom.room.wallColor}
                    onChange={(e) => updateRoomSettings({ wallColor: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Floor Color</label>
                  <Input
                    type="color"
                    value={currentRoom.room.floorColor}
                    onChange={(e) => updateRoomSettings({ floorColor: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Ceiling Color</label>
                  <Input
                    type="color"
                    value={currentRoom.room.ceilingColor}
                    onChange={(e) => updateRoomSettings({ ceilingColor: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Furniture Library */}
            <Card>
              <CardHeader>
                <CardTitle>Furniture Library</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {furniture.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center justify-between p-2 border rounded hover:bg-gray-50"
                    >
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-gray-500">
                          {item.size.width}×{item.size.depth}×{item.size.height}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAddFurniture(item)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  
                  {furniture.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No furniture available. Upload some models first.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Editor */}
        <div className="flex-1">
          {editorMode === '2d' ? (
            <Editor2D />
          ) : (
            <Scene3D />
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomEditor;
