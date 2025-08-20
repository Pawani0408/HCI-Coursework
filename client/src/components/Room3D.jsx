import React from 'react';
import { Box } from '@react-three/drei';

const Room3D = ({ room }) => {
  const { width, depth, height, wallColor, floorColor, ceilingColor } = room;

  return (
    <group>
      {/* Ceiling */}
      <Box
        args={[width, 0.1, depth]}
        position={[0, height + 0.05, 0]}
      >
        <meshLambertMaterial color={ceilingColor} />
      </Box>

      {/* Walls */}
      {/* Back wall */}
      <Box
        args={[width, height, 0.1]}
        position={[0, height / 2, -depth / 2]}
        receiveShadow
      >
        <meshLambertMaterial color={wallColor} />
      </Box>

      {/* Front wall (partial for visibility) */}
      <Box
        args={[width, height / 3, 0.1]}
        position={[0, height / 6, depth / 2]}
        receiveShadow
      >
        <meshLambertMaterial color={wallColor} transparent opacity={0.3} />
      </Box>

      {/* Left wall */}
      <Box
        args={[0.1, height, depth]}
        position={[-width / 2, height / 2, 0]}
        receiveShadow
      >
        <meshLambertMaterial color={wallColor} />
      </Box>

      {/* Right wall */}
      <Box
        args={[0.1, height, depth]}
        position={[width / 2, height / 2, 0]}
        receiveShadow
      >
        <meshLambertMaterial color={wallColor} />
      </Box>
    </group>
  );
};

export default Room3D;
