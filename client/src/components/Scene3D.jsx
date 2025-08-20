import React, { Suspense, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { useRoomStore } from '@/store/roomStore';
import { useFurnitureStore } from '@/store/furnitureStore';
import Room3D from './Room3D';
import FurnitureModel from './FurnitureModel';

// Component to set scene background color
const SceneBackground = () => {
  const { scene } = useThree();
  
  useEffect(() => {
    scene.background = new THREE.Color(0xffffff); // White background
  }, [scene]);
  
  return null;
};

const Scene3D = ({ isViewer = false }) => {
  const { currentRoom, selectedFurniture, setSelectedFurniture, updateFurniture } = useRoomStore();
  const { furniture } = useFurnitureStore();

  // Calculate optimal camera position based on room dimensions
  const getCameraPosition = () => {
    const { width, depth, height } = currentRoom.room;
    const maxDimension = Math.max(width, depth, height);
    
    // Calculate camera distance based on room size
    const distance = Math.max(10, maxDimension * 1.5);
    
    return [distance, distance * 0.6, distance];
  };

  const handleFurnitureClick = (index) => {
    if (!isViewer) {
      setSelectedFurniture(index);
    }
  };

        const handleFurniturePositionChange = (index, newPosition) => {
        if (!isViewer) {
          // Constrain furniture to room boundaries
          const roomWidth = currentRoom.room.width / 2;
          const roomDepth = currentRoom.room.depth / 2;
          
          const constrainedPosition = {
            x: Math.max(-roomWidth + 0.5, Math.min(roomWidth - 0.5, newPosition.x)),
            y: 0, // Keep furniture on the floor surface
            z: Math.max(-roomDepth + 0.5, Math.min(roomDepth - 0.5, newPosition.z))
          };
          
          updateFurniture(index, { position: constrainedPosition });
        }
      };

  // Add keyboard controls for fine-tuning
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedFurniture !== null && !isViewer) {
        const currentFurniture = currentRoom.furniture[selectedFurniture];
        if (!currentFurniture) return;

        const step = e.shiftKey ? 0.1 : 0.5; // Fine control with Shift
        let newPosition = { ...currentFurniture.position };

        switch (e.key) {
          case 'ArrowUp':
            newPosition.z -= step;
            break;
          case 'ArrowDown':
            newPosition.z += step;
            break;
          case 'ArrowLeft':
            newPosition.x -= step;
            break;
          case 'ArrowRight':
            newPosition.x += step;
            break;
          // Removed PageUp/PageDown to keep furniture on floor
          default:
            return;
        }

        e.preventDefault();
        
        // Apply the same constraints as drag movement
        const roomWidth = currentRoom.room.width / 2;
        const roomDepth = currentRoom.room.depth / 2;
        
        const constrainedPosition = {
          x: Math.max(-roomWidth + 0.5, Math.min(roomWidth - 0.5, newPosition.x)),
          y: 0, // Keep furniture on the floor surface
          z: Math.max(-roomDepth + 0.5, Math.min(roomDepth - 0.5, newPosition.z))
        };
        
        updateFurniture(selectedFurniture, { position: constrainedPosition });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedFurniture, currentRoom.furniture, updateFurniture, isViewer]);

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ 
          position: getCameraPosition(), 
          fov: 60 
        }}
        shadows
        className="bg-white w-full h-full"
        gl={{ antialias: true, alpha: false }}
        style={{ height: '100%', width: '100%' }}
      >
        <Suspense fallback={null}>
          {/* Scene Background */}
          <SceneBackground />
          
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          
          {/* Environment */}
          <Environment preset="studio" />
          
          {/* Grid */}
          <Grid
            position={[0, 0, 0]}
            args={[currentRoom.room.width + 5, currentRoom.room.depth + 5]}
            cellSize={1}
            cellThickness={0.3}
            cellColor={currentRoom.room.floorColor}
            sectionSize={5}
            sectionThickness={0.8}
            sectionColor={currentRoom.room.floorColor}
          />
          
          {/* Room */}
          <Room3D room={currentRoom.room} />
          
          {/* Furniture */}
          {currentRoom.furniture.map((item, index) => {
            // Handle both populated and unpopulated furniture data
            let furnitureData;
            let modelId;
            
            if (typeof item.modelId === 'string') {
              // Unpopulated data - modelId is a string
              modelId = item.modelId;
              furnitureData = furniture.find(f => f._id === modelId);
            } else if (item.modelId && item.modelId._id) {
              // Populated data - modelId is an object with full furniture data
              modelId = item.modelId._id;
              furnitureData = item.modelId; // Use the populated data directly
            } else {
              console.warn('Invalid furniture item structure:', item);
              return null;
            }
            
            // Debug logging
            if (!furnitureData) {
              console.warn(`Furniture not found for modelId: ${modelId}`, {
                availableFurniture: furniture.map(f => ({ id: f._id, name: f.name })),
                itemModelId: modelId,
                item: item
              });
              return null;
            }
            
            return (
              <FurnitureModel
                key={index}
                index={index}
                furnitureData={furnitureData}
                position={[item.position.x, item.position.y, item.position.z]}
                rotation={[item.rotation.x, item.rotation.y, item.rotation.z]}
                scale={typeof item.scale === 'number' ? [item.scale, item.scale, item.scale] : [item.scale.x, item.scale.y, item.scale.z]}
                isSelected={selectedFurniture === index}
                onClick={() => handleFurnitureClick(index)}
                onPositionChange={(newPosition) => handleFurniturePositionChange(index, newPosition)}
                isViewer={isViewer}
              />
            );
          })}
          
          {/* Controls */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={Math.max(5, Math.min(currentRoom.room.width, currentRoom.room.depth) * 0.8)}
            maxDistance={Math.max(50, Math.max(currentRoom.room.width, currentRoom.room.depth) * 3)}
            maxPolarAngle={Math.PI / 2.1}
            enableDamping={false}
            dampingFactor={0.05}
          />
        </Suspense>
      </Canvas>
      
      {/* Room dimensions - bottom left */}
      <div className="absolute bottom-4 left-4 text-sm text-gray-600 bg-white/80 p-2 rounded">
        <div className="font-medium">Room Dimensions</div>
        <div>{currentRoom.room.width}m × {currentRoom.room.depth}m × {currentRoom.room.height}m</div>
      </div>
      
      {/* Controls overlay - top left */}
      <div className="absolute top-4 left-4 text-sm text-gray-600 bg-white/80 p-2 rounded">
        <div>3D View - Use mouse to orbit, zoom, and pan</div>
        {selectedFurniture !== null && !isViewer && (
          <div className="mt-1 text-xs">
            <div>Selected furniture: Click and drag to move</div>
            <div>Arrow keys: Move furniture (Shift for fine control)</div>
            <div>Grid is the floor surface</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Scene3D;
