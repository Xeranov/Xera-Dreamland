import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface SingleCloudProps {
  position: [number, number, number];
  scale?: number;
  speed?: number;
}

const SingleCloud: React.FC<SingleCloudProps> = ({
  position,
  scale = 1.0,
  speed = 0.5,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const initialPos = useRef(position);

  useFrame(() => {
    if (!groupRef.current) return;
    const t = performance.now() * 0.0006 * speed;
    groupRef.current.position.x = initialPos.current[0] + Math.sin(t) * 1.5;
    groupRef.current.position.y = initialPos.current[1] + Math.cos(t * 1.4) * 0.3;
  });

  const cloudMat = new THREE.MeshStandardMaterial({
    color: '#FFF8FA',
    roughness: 0.25,
    metalness: 0.0,
  });

  return (
    <group ref={groupRef} position={position} scale={[scale, scale, scale]}>
      {/* Central fluff */}
      <mesh castShadow receiveShadow material={cloudMat} position={[0, 0, 0]}>
        <sphereGeometry args={[1.2, 16, 16]} />
      </mesh>
      {/* Left puff */}
      <mesh castShadow receiveShadow material={cloudMat} position={[-0.9, -0.2, 0.2]}>
        <sphereGeometry args={[0.85, 14, 14]} />
      </mesh>
      {/* Right puff */}
      <mesh castShadow receiveShadow material={cloudMat} position={[0.9, -0.15, -0.1]}>
        <sphereGeometry args={[0.95, 14, 14]} />
      </mesh>
      {/* Top puff */}
      <mesh castShadow receiveShadow material={cloudMat} position={[0.2, 0.6, 0.1]}>
        <sphereGeometry args={[0.8, 14, 14]} />
      </mesh>
      {/* Bottom flatter base */}
      <mesh castShadow receiveShadow material={cloudMat} position={[0, -0.4, 0]} scale={[1.8, 0.5, 1.2]}>
        <sphereGeometry args={[0.9, 14, 14]} />
      </mesh>
    </group>
  );
};

export const CloudDecor: React.FC = () => {
  return (
    <group>
      <SingleCloud position={[-16, 2, -14]} scale={1.8} speed={0.8} />
      <SingleCloud position={[18, 4, -12]} scale={2.2} speed={0.6} />
      <SingleCloud position={[-20, 6, 15]} scale={2.0} speed={0.7} />
      <SingleCloud position={[16, 1, 16]} scale={1.6} speed={0.9} />
      <SingleCloud position={[0, -4, -22]} scale={3.0} speed={0.5} />
      <SingleCloud position={[22, -2, 0]} scale={2.5} speed={0.65} />
    </group>
  );
};
