import React, { useRef, useState, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const FurnitureModel = ({ 
  furnitureData, 
  position, 
  rotation, 
  scale, 
  isSelected, 
  onClick, 
  isViewer = false,
  onPositionChange
}) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { camera, raycaster, mouse } = useThree();
  const dragPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  
  // Try to load the GLTF model, fallback to a simple box if it fails
  let gltf;
  try {
    gltf = useGLTF(furnitureData.fileUrl);
  } catch (error) {
    console.warn(`Failed to load model: ${furnitureData.fileUrl}`, error);
    gltf = null;
  }

  // Removed auto-rotation - furniture stays still when selected

  const handleClick = (e) => {
    e.stopPropagation();
    if (onClick) onClick();
  };

  const handlePointerOver = (e) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    setHovered(false);
    document.body.style.cursor = 'default';
  };

  const handlePointerDown = (e) => {
    if (isViewer) return;
    e.stopPropagation();
    setIsDragging(true);
    document.body.style.cursor = 'grabbing';
  };

  const handlePointerUp = () => {
    if (isViewer) return;
    setIsDragging(false);
    document.body.style.cursor = 'default';
  };

  // Add global pointer up handler for better drag experience
  useEffect(() => {
    const handleGlobalPointerUp = () => {
      if (isDragging) {
        setIsDragging(false);
        document.body.style.cursor = 'default';
      }
    };

    document.addEventListener('pointerup', handleGlobalPointerUp);
    return () => document.removeEventListener('pointerup', handleGlobalPointerUp);
  }, [isDragging]);

  // Handle dragging
  useFrame(() => {
    if (isDragging && isSelected && !isViewer && onPositionChange) {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectPlane(dragPlane.current);
      
      if (intersects.length > 0) {
        const newPosition = {
          x: intersects[0].point.x,
          y: 0, // Keep furniture on the floor surface
          z: intersects[0].point.z
        };
        onPositionChange(newPosition);
      }
    }
  });

  return (
    <group
      ref={meshRef}
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      {gltf && gltf.scene ? (
        <primitive 
          object={gltf.scene.clone()} 
          castShadow
          receiveShadow
          position={[0, 0, 0]} // Keep GLTF model at its original position
        />
      ) : (
        // Fallback to a simple colored box if GLTF fails to load
        <mesh castShadow receiveShadow position={[0, (furnitureData.size?.height || 1) / 2, 0]}>
          <boxGeometry args={[
            furnitureData.size?.width || 1,
            furnitureData.size?.height || 1,
            furnitureData.size?.depth || 1
          ]} />
          <meshStandardMaterial 
            color={
              isSelected ? '#4ecdc4' : 
              hovered ? '#95a5a6' : 
              '#95a5a6'
            }
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
      )}
      
      {/* Selection indicator - just a subtle floor indicator */}
      {isSelected && !isViewer && (
        <mesh position={[0, 0.01, 0]}>
          <cylinderGeometry args={[
            Math.max(furnitureData.size?.width || 1, furnitureData.size?.depth || 1) * 0.6,
            Math.max(furnitureData.size?.width || 1, furnitureData.size?.depth || 1) * 0.6,
            0.02
          ]} />
          <meshBasicMaterial color="#4ecdc4" transparent opacity={0.2} />
        </mesh>
      )}
    </group>
  );
};

export default FurnitureModel;
