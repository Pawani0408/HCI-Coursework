import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { useGLTF } from '@react-three/drei';

const FurniturePreview = ({ fileUrl }) => {
  let gltf;
  try {
    gltf = useGLTF(fileUrl);
  } catch (error) {
    console.warn(`Failed to load model: ${fileUrl}`, error);
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshLambertMaterial color="#95a5a6" />
      </mesh>
    );
  }

  return (
    <primitive 
      object={gltf.scene.clone()} 
      scale={2}
      position={[0, 0, 0]}
    />
  );
};

const FurnitureViewer = ({ furnitureData, isOpen, onClose }) => {
  if (!isOpen || !furnitureData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{furnitureData.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 3D Preview */}
          <div className="h-96 border border-gray-300 rounded-lg">
            <Canvas camera={{ position: [3, 3, 3], fov: 60 }}>
              <Suspense fallback={null}>
                <ambientLight intensity={0.4} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <Environment preset="studio" />
                <FurniturePreview fileUrl={furnitureData.fileUrl} />
                <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
              </Suspense>
            </Canvas>
          </div>
          
          {/* Furniture Details */}
          <div className="space-y-4">
            <div>
              <label className="font-semibold">Dimensions:</label>
              <p>{furnitureData.size.width} × {furnitureData.size.depth} × {furnitureData.size.height} units</p>
            </div>
            
            {furnitureData.tags.length > 0 && (
              <div>
                <label className="font-semibold">Tags:</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {furnitureData.tags.map((tag, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <label className="font-semibold">File URL:</label>
              <p className="text-sm text-gray-600 break-all">{furnitureData.fileUrl}</p>
            </div>
            
            <div>
              <label className="font-semibold">Created by:</label>
              <p>{furnitureData.createdBy?.username || 'Unknown'}</p>
            </div>
            
            <div>
              <label className="font-semibold">Created:</label>
              <p>{new Date(furnitureData.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FurnitureViewer;
