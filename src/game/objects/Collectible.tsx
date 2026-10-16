import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { RigidBody, BallCollider } from '@react-three/rapier';
import { SaveManager } from '../systems/SaveManager';
import { AudioManager } from '../systems/AudioManager';
import { GameState } from '../systems/GameState';

interface CollectibleProps {
  id: string;
  position: [number, number, number];
}

export const Collectible: React.FC<CollectibleProps> = ({ id, position }) => {
  const isInitiallyCollected = SaveManager.isStarCollected(id);
  const [collected, setCollected] = useState<boolean>(isInitiallyCollected);
  const starMeshRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const animTimeRef = useRef<number>(Math.random() * 10);

  useFrame((_, delta) => {
    if (collected || !starMeshRef.current) return;
    animTimeRef.current += delta;
    const t = animTimeRef.current;

    // Gentle floating bob & rotation
    starMeshRef.current.position.y = Math.sin(t * 2.5) * 0.12;
    starMeshRef.current.rotation.y += delta * 1.8;
    starMeshRef.current.rotation.z = Math.sin(t * 1.2) * 0.1;

    if (ringRef.current) {
      ringRef.current.rotation.x = Math.PI / 2 + Math.sin(t * 2) * 0.2;
      ringRef.current.rotation.z += delta * 1.2;
    }
  });

  const handleIntersection = () => {
    if (collected) return;
    const wasCollected = SaveManager.collectStar(id);
    if (wasCollected) {
      setCollected(true);
      AudioManager.playStarCollect();
      GameState.showBanner('Star Fragment discovered! ✨ (+1)');
    }
  };

  if (collected) return null;

  return (
    <group position={position}>
      {/* Rapier Sensor Trigger */}
      <RigidBody type="fixed" colliders={false} sensor onIntersectionEnter={handleIntersection}>
        <BallCollider args={[0.65]} />
      </RigidBody>

      {/* Visual 3D Star */}
      <group ref={starMeshRef}>
        {/* Core Star Body (Stylized 5-pointed diamond star) */}
        <mesh castShadow>
          <octahedronGeometry args={[0.28, 0]} />
          <meshStandardMaterial
            color="#FFDF6D"
            emissive="#FFA500"
            emissiveIntensity={0.5}
            roughness={0.15}
            metalness={0.4}
          />
        </mesh>

        {/* Secondary intersecting diamond for 3D star sparkle */}
        <mesh rotation={[0, Math.PI / 4, 0]} scale={[0.85, 1.2, 0.85]}>
          <octahedronGeometry args={[0.26, 0]} />
          <meshStandardMaterial
            color="#FFF1A8"
            emissive="#FFD700"
            emissiveIntensity={0.6}
            roughness={0.1}
          />
        </mesh>

        {/* Floating Magical Ring */}
        <mesh ref={ringRef} scale={[0.42, 0.42, 0.42]}>
          <torusGeometry args={[1, 0.04, 12, 32]} />
          <meshStandardMaterial
            color="#F6A9D2"
            emissive="#E887B7"
            emissiveIntensity={0.4}
            roughness={0.2}
          />
        </mesh>

        {/* Warm local glow light */}
        <pointLight color="#FFE28A" intensity={1.5} distance={3.5} />
      </group>
    </group>
  );
};
