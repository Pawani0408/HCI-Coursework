import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useRoomStore } from '@/store/roomStore';
import { useFurnitureStore } from '@/store/furnitureStore';
import { Button } from '@/components/ui/button';
import { Trash2, RotateCw, Move, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

const Editor2D = ({ isViewer = false }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [scale, setScale] = useState(20); // pixels per unit
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  
  const { 
    currentRoom, 
    selectedFurniture, 
    setSelectedFurniture, 
    updateFurniture, 
    removeFurniture 
  } = useRoomStore();
  
  const { furniture } = useFurnitureStore();

  // Calculate responsive canvas size based on room dimensions
  const calculateCanvasSize = useCallback(() => {
    if (!containerRef.current || !currentRoom.room) return;
    
    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // Calculate room dimensions in pixels with extra padding for better visibility
    const roomWidthPx = currentRoom.room.width * scale;
    const roomHeightPx = currentRoom.room.depth * scale;
    
    // Add more padding around the room for better navigation
    const padding = 200; // Increased from 100 to 200
    const minWidth = roomWidthPx + padding * 2;
    const minHeight = roomHeightPx + padding * 2;
    
    // Calculate optimal canvas size
    let canvasWidth = Math.max(minWidth, containerWidth);
    let canvasHeight = Math.max(minHeight, containerHeight);
    
    // Maintain aspect ratio if needed
    const aspectRatio = canvasWidth / canvasHeight;
    const roomAspectRatio = roomWidthPx / roomHeightPx;
    
    if (aspectRatio > roomAspectRatio) {
      // Container is wider than room, adjust height
      canvasHeight = canvasWidth / roomAspectRatio;
    } else {
      // Container is taller than room, adjust width
      canvasWidth = canvasHeight * roomAspectRatio;
    }
    
    setCanvasSize({ width: canvasWidth, height: canvasHeight });
  }, [currentRoom.room, scale]);

  // Update canvas size when room or scale changes
  useEffect(() => {
    calculateCanvasSize();
  }, [calculateCanvasSize]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      calculateCanvasSize();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculateCanvasSize]);

  // Convert world coordinates to canvas coordinates with pan offset
  const worldToCanvas = (x, z) => ({
    x: canvasSize.width / 2 + x * scale + panOffset.x,
    y: canvasSize.height / 2 + z * scale + panOffset.y
  });

  // Convert canvas coordinates to world coordinates with pan offset
  const canvasToWorld = (x, y) => ({
    x: (x - canvasSize.width / 2 - panOffset.x) / scale,
    z: (y - canvasSize.height / 2 - panOffset.y) / scale
  });

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !currentRoom.room) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
    
    // Fill canvas background with floor color
    const floorColor = currentRoom.room.floorColor || '#f0f0f0';
    ctx.fillStyle = floorColor;
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
    
    // Calculate room boundaries with pan offset
    const roomWidth = currentRoom.room.width * scale;
    const roomHeight = currentRoom.room.depth * scale;
    const roomX = canvasSize.width / 2 - roomWidth / 2 + panOffset.x;
    const roomY = canvasSize.height / 2 - roomHeight / 2 + panOffset.y;
    
    // Draw grid with floor color
    // Create a slightly darker version of the floor color for grid lines
    const gridColor = floorColor === '#ffffff' ? '#e0e0e0' : 
                     floorColor === '#000000' ? '#333333' : 
                     floorColor + '80'; // Add 50% opacity for darker grid lines
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    
    // Calculate grid range based on room size
    const gridRange = Math.max(currentRoom.room.width, currentRoom.room.depth) + 4; // Increased range
    
    for (let i = -gridRange; i <= gridRange; i++) {
      const x = canvasSize.width / 2 + i * scale + panOffset.x;
      const y = canvasSize.height / 2 + i * scale + panOffset.y;
      
      if (x >= 0 && x <= canvasSize.width) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasSize.height);
        ctx.stroke();
      }
      
      if (y >= 0 && y <= canvasSize.height) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasSize.width, y);
        ctx.stroke();
      }
    }
    
    // Draw room boundaries
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.strokeRect(roomX, roomY, roomWidth, roomHeight);
    
    // Fill room with floor color
    ctx.fillStyle = (currentRoom.room.floorColor || '#f0f0f0') + '40';
    ctx.fillRect(roomX, roomY, roomWidth, roomHeight);
    
    // Draw furniture
    currentRoom.furniture.forEach((item, index) => {
      // Handle both populated and unpopulated furniture data
      let furnitureData;
      if (typeof item.modelId === 'string') {
        furnitureData = furniture.find(f => f._id === item.modelId);
      } else if (item.modelId && item.modelId._id) {
        furnitureData = furniture.find(f => f._id === item.modelId._id);
      }
      
      if (!furnitureData) {
        // Fallback for unknown furniture
        const pos = worldToCanvas(item.position.x, item.position.z);
        ctx.fillStyle = selectedFurniture === index ? '#ff6b6b' : '#999';
        ctx.fillRect(pos.x - 10, pos.y - 10, 20, 20);
        ctx.fillStyle = '#333';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Unknown', pos.x, pos.y + 5);
        return;
      }
      
      const pos = worldToCanvas(item.position.x, item.position.z);
      // Use even smaller furniture sizing - scale down furniture to 15% of grid scale
      const furnitureScale = scale * 0.15; // Reduced from 0.3 to 0.15
      const width = (furnitureData.size?.width || 1) * furnitureScale;
      const height = (furnitureData.size?.depth || 1) * furnitureScale;
      
      ctx.save();
      ctx.translate(pos.x, pos.y);
      ctx.rotate(item.rotation.y);
      
      // Draw furniture as rectangle
      ctx.fillStyle = selectedFurniture === index ? '#ff6b6b' : '#4ecdc4';
      ctx.fillRect(-width / 2, -height / 2, width, height);
      
      ctx.strokeStyle = '#333';
      ctx.lineWidth = selectedFurniture === index ? 3 : 1;
      ctx.strokeRect(-width / 2, -height / 2, width, height);
      
      // Draw name
      ctx.fillStyle = '#333';
      ctx.font = '10px Arial'; // Reduced font size
      ctx.textAlign = 'center';
      ctx.fillText(furnitureData.name, 0, height / 2 + 12);
      
      ctx.restore();
    });
    
    // Draw center axes
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(canvasSize.width / 2 + panOffset.x, 0);
    ctx.lineTo(canvasSize.width / 2 + panOffset.x, canvasSize.height);
    ctx.moveTo(0, canvasSize.height / 2 + panOffset.y);
    ctx.lineTo(canvasSize.width, canvasSize.height / 2 + panOffset.y);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  useEffect(() => {
    drawCanvas();
  }, [currentRoom, selectedFurniture, furniture, scale, canvasSize, panOffset]);

  const handleCanvasClick = (e) => {
    if (isViewer) return; // Only allow furniture selection in editor mode
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if clicking on furniture
    let clickedIndex = -1;
    currentRoom.furniture.forEach((item, index) => {
      let furnitureData;
      if (typeof item.modelId === 'string') {
        furnitureData = furniture.find(f => f._id === item.modelId);
      } else if (item.modelId && item.modelId._id) {
        furnitureData = furniture.find(f => f._id === item.modelId._id);
      }
      
      if (!furnitureData) return;
      
      const pos = worldToCanvas(item.position.x, item.position.z);
      // Use same furniture scale for click detection
      const furnitureScale = scale * 0.15;
      const width = (furnitureData.size?.width || 1) * furnitureScale;
      const height = (furnitureData.size?.depth || 1) * furnitureScale;
      
      if (
        x >= pos.x - width / 2 &&
        x <= pos.x + width / 2 &&
        y >= pos.y - height / 2 &&
        y <= pos.y + height / 2
      ) {
        clickedIndex = index;
      }
    });
    
    setSelectedFurniture(clickedIndex >= 0 ? clickedIndex : null);
  };

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (!isViewer && selectedFurniture !== null) {
      // Dragging furniture (only in editor mode)
      const item = currentRoom.furniture[selectedFurniture];
      const pos = worldToCanvas(item.position.x, item.position.z);
      
      setDraggedItem(selectedFurniture);
      setDragOffset({ x: x - pos.x, y: y - pos.y });
    } else {
      // Panning canvas (works in both editor and viewer mode)
      setIsPanning(true);
      setPanStart({ x: x - panOffset.x, y: y - panOffset.y });
    }
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (draggedItem !== null) {
      // Dragging furniture
      const worldPos = canvasToWorld(x - dragOffset.x, y - dragOffset.y);
      
      updateFurniture(draggedItem, {
        position: {
          ...currentRoom.furniture[draggedItem].position,
          x: worldPos.x,
          z: worldPos.z
        }
      });
    } else if (isPanning) {
      // Panning canvas
      setPanOffset({
        x: x - panStart.x,
        y: y - panStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setDraggedItem(null);
    setDragOffset({ x: 0, y: 0 });
    setIsPanning(false);
  };

  // Handle mouse wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Calculate zoom factor
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(5, Math.min(50, scale * zoomFactor));
    
    if (newScale !== scale) {
      // Calculate the world position under the mouse before zoom
      const worldPos = canvasToWorld(mouseX, mouseY);
      
      // Update scale
      setScale(newScale);
      
      // Adjust pan to keep the point under mouse in the same position
      const newCanvasPos = {
        x: canvasSize.width / 2 + worldPos.x * newScale,
        y: canvasSize.height / 2 + worldPos.z * newScale
      };
      
      setPanOffset({
        x: mouseX - newCanvasPos.x,
        y: mouseY - newCanvasPos.y
      });
    }
  };

  const rotateFurniture = () => {
    if (selectedFurniture === null) return;
    
    updateFurniture(selectedFurniture, {
      rotation: {
        ...currentRoom.furniture[selectedFurniture].rotation,
        y: currentRoom.furniture[selectedFurniture].rotation.y + Math.PI / 2
      }
    });
  };

  const deleteFurniture = () => {
    if (selectedFurniture === null) return;
    
    removeFurniture(selectedFurniture);
    setSelectedFurniture(null);
  };

  const resetPan = () => {
    setPanOffset({ x: 0, y: 0 });
  };

  const resetZoom = () => {
    setScale(20);
    setPanOffset({ x: 0, y: 0 });
  };

  const zoomIn = () => {
    setScale(prev => Math.min(50, prev + 5));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(5, prev - 5));
  };

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col">
      <div className="flex-1 relative overflow-auto">
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className="border border-gray-300 cursor-crosshair block mx-auto"
          style={{
            minWidth: '100%',
            minHeight: '100%',
            maxWidth: '100%',
            maxHeight: '100%'
          }}
          onClick={handleCanvasClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        />
        
        <div className="absolute top-4 left-4 text-sm text-gray-600 bg-white/80 px-2 py-1 rounded">
          2D Top-Down View - Click furniture to select, drag to move, drag empty space to pan, scroll to zoom
        </div>
        
        {/* Zoom and Pan controls */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            size="sm"
            onClick={zoomIn}
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            onClick={zoomOut}
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={resetPan}
            title="Reset Pan"
          >
            <Move className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={resetZoom}
            title="Reset Zoom"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* Zoom level indicator */}
        <div className="absolute bottom-4 right-4 text-xs text-gray-600 bg-white/80 px-2 py-1 rounded">
          Zoom: {Math.round((scale / 20) * 100)}%
        </div>
      </div>
      
      {/* Controls */}
      {!isViewer && selectedFurniture !== null && (
        <div className="p-4 border-t bg-gray-50 flex gap-2">
          <Button size="sm" onClick={rotateFurniture}>
            <RotateCw className="w-4 h-4 mr-2" />
            Rotate
          </Button>
          <Button size="sm" variant="destructive" onClick={deleteFurniture}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      )}
    </div>
  );
};

export default Editor2D;
