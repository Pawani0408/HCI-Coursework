import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { 
  Home, 
  Eye, 
  RotateCcw, 
  Layout, 
  ArrowLeft,
  Info
} from 'lucide-react';
import { useRoomStore } from '@/store/roomStore';
import { useFurnitureStore } from '@/store/furnitureStore';
import { roomAPI, furnitureAPI } from '@/lib/api';
import Scene3D from '@/components/Scene3D';
import Editor2D from '@/components/Editor2D';

const PublicViewer = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('3d');
  const [screenDimensions, setScreenDimensions] = useState({ width: 10, depth: 10, height: 3 });
  const [dimensionsCalculated, setDimensionsCalculated] = useState(false);
  
  const { setRoom, clearRoom, currentRoom, updateRoomSettings } = useRoomStore();
  const { setFurniture } = useFurnitureStore();

  // Calculate optimal room dimensions based on screen size
  const calculateRoomDimensions = useCallback(() => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Calculate room dimensions based on viewport
    // Use a ratio that works well for 3D viewing
    const aspectRatio = viewportWidth / viewportHeight;
    
    let width, depth, height;
    
    if (aspectRatio > 1.5) {
      // Wide screen - make room wider
      width = Math.max(15, Math.min(25, viewportWidth / 100));
      depth = Math.max(10, Math.min(20, viewportHeight / 80));
      height = Math.max(3, Math.min(8, viewportHeight / 120));
    } else if (aspectRatio < 0.8) {
      // Tall screen - make room deeper
      width = Math.max(10, Math.min(20, viewportWidth / 120));
      depth = Math.max(15, Math.min(25, viewportHeight / 60));
      height = Math.max(3, Math.min(8, viewportHeight / 100));
    } else {
      // Standard screen - balanced dimensions
      width = Math.max(12, Math.min(22, viewportWidth / 110));
      depth = Math.max(12, Math.min(22, viewportHeight / 70));
      height = Math.max(3, Math.min(8, viewportHeight / 110));
    }
    
    const newDimensions = {
      width: Math.round(width),
      depth: Math.round(depth),
      height: Math.round(height)
    };
    
    setScreenDimensions(newDimensions);
    return newDimensions;
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const newDimensions = calculateRoomDimensions();
      
      // Only update room settings if room is loaded and dimensions have changed
      if (currentRoom.room && dimensionsCalculated) {
        updateRoomSettings(newDimensions);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculateRoomDimensions, currentRoom.room, dimensionsCalculated, updateRoomSettings]);

  // Initial dimension calculation
  useEffect(() => {
    if (!dimensionsCalculated) {
      calculateRoomDimensions();
      setDimensionsCalculated(true);
    }
  }, [calculateRoomDimensions, dimensionsCalculated]);

  useEffect(() => {
    loadRoomDesign();
    return () => clearRoom();
  }, [id]);

  const loadRoomDesign = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load furniture list and room design
      const [furnitureRes, roomRes] = await Promise.all([
        furnitureAPI.getAll(),
        roomAPI.getById(id)
      ]);
      
      setFurniture(furnitureRes.data.data);
      
      // Load room data
      const roomData = roomRes.data.data;
      setRoom(roomData);
      
      // Update room dimensions to fit screen after room is loaded
      if (dimensionsCalculated && screenDimensions.width) {
        setTimeout(() => {
          updateRoomSettings({
            width: screenDimensions.width,
            depth: screenDimensions.depth,
            height: screenDimensions.height
          });
        }, 100);
      }
      
    } catch (error) {
      console.error('Failed to load room design:', error);
      setError(error.response?.data?.message || 'Room design not found');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading room design...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        {/* Navigation */}
        <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <Button variant="ghost" asChild className="mr-4">
                  <Link to="/">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
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
            </div>
          </div>
        </nav>

        <div className="flex items-center justify-center min-h-[80vh]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="max-w-md border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-red-600 text-center">Error</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-6">{error}</p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={loadRoomDesign} size="sm">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/">
                      <Home className="w-4 h-4 mr-2" />
                      Go Home
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col overflow-hidden">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200 flex-shrink-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Button variant="ghost" asChild className="mr-4">
                <Link to="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
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
              <Tabs value={viewMode} onValueChange={setViewMode}>
                <TabsList>
                  <TabsTrigger value="2d">
                    <Eye className="w-4 h-4 mr-2" />
                    2D View
                  </TabsTrigger>
                  <TabsTrigger value="3d">
                    <Eye className="w-4 h-4 mr-2" />
                    3D View
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Button variant="outline" asChild>
                <Link to="/">
                  <Home className="w-4 h-4 mr-2" />
                  Browse More
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Viewer */}
      <div className="flex-1 relative w-full h-full">
        {viewMode === '2d' ? (
          <Editor2D isViewer={true} />
        ) : (
          <Scene3D isViewer={true} />
        )}
        
        {/* Info Panel */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-4 max-w-sm border border-gray-200">
          <div className="flex items-center mb-3">
            <Info className="w-4 h-4 mr-2 text-blue-600" />
            <h3 className="font-semibold text-lg">Room Information</h3>
          </div>
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Dimensions:</span>{' '}
              {currentRoom.room.width}×{currentRoom.room.depth}×{currentRoom.room.height} units
            </p>
            <p>
              <span className="font-medium">Furniture items:</span>{' '}
              {currentRoom.furniture.length}
            </p>
            <p className="text-gray-600 text-xs pt-2 border-t border-gray-200">
              Use mouse to interact with the {viewMode.toUpperCase()} view.
              {viewMode === '3d' && ' Drag to orbit, scroll to zoom.'}
              {viewMode === '2d' && ' Click items to see details.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicViewer;