import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CylinderCollider } from '@react-three/rapier';
import { SaveManager } from '../systems/SaveManager';
import { AudioManager } from '../systems/AudioManager';
import { GameState } from '../systems/GameState';

interface CheckpointProps {
  id: string;
  position: [number, number, number];
  name?: string;
}

export const Checkpoint: React.FC<CheckpointProps> = ({
  id,
  position,
  name = 'Sakura Checkpoint',
}) => {
  const crystalRef = useRef<THREE.Mesh>(null);
  const flagRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const currentSave = SaveManager.getData();
  const isActive = currentSave.checkpointId === id;

  useFrame((_, delta) => {
    const t = performance.now() * 0.002;

    if (crystalRef.current) {
      crystalRef.current.rotation.y += delta * (isActive ? 2.0 : 0.8);
      crystalRef.current.position.y = 1.35 + Math.sin(t * 2) * 0.08;
    }

    if (flagRef.current) {
      flagRef.current.rotation.y = Math.sin(t * 3) * 0.15;
    }

    if (lightRef.current) {
      lightRef.current.intensity = isActive ? 2.5 + Math.sin(t * 4) * 0.5 : 0.8;
    }
  });

  const handleIntersection = () => {
    if (SaveManager.getData().checkpointId === id) return;
    SaveManager.setCheckpoint(id, [position[0], position[1] + 0.5, position[2]]);
    AudioManager.playCheckpoint();
    GameState.showBanner(`${name} activated! 🐾`);
  };

  return (
    <group position={position}>
      {/* Sensor Trigger */}
      <RigidBody type="fixed" colliders={false} sensor onIntersectionEnter={handleIntersection}>
        <CylinderCollider args={[1.5, 1.2]} position={[0, 1, 0]} />
      </RigidBody>

      {/* Stone Pedestal Base */}
      <mesh castShadow receiveShadow position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.7, 0.85, 0.3, 16]} />
        <meshStandardMaterial color="#E2D9E4" roughness={0.6} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.55, 0.65, 0.2, 16]} />
        <meshStandardMaterial color="#FFF4F8" roughness={0.4} />
      </mesh>

      {/* Flag Pole */}
      <mesh castShadow position={[0.45, 0.9, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.4, 8]} />
        <meshStandardMaterial color="#D4A76A" roughness={0.3} metalness={0.5} />
      </mesh>

      {/* Flag Cloth */}
      <mesh
        ref={flagRef}
        position={[0.65, 1.4, 0]}
        scale={[1, 1, 1]}
      >
        <planeGeometry args={[0.4, 0.3]} />
        <meshStandardMaterial
          color={isActive ? '#F6A9D2' : '#C9B8FF'}
          roughness={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Floating Checkpoint Crystal */}
      <mesh ref={crystalRef} castShadow position={[0, 1.35, 0]} scale={[0.3, 0.55, 0.3]}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color={isActive ? '#F6A9D2' : '#C9B8FF'}
          emissive={isActive ? '#E887B7' : '#9D84F0'}
          emissiveIntensity={isActive ? 0.7 : 0.3}
          roughness={0.15}
          metalness={0.2}
        />
      </mesh>

      {/* Pedestal Rune Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.46, 0]}>
        <ringGeometry args={[0.3, 0.48, 24]} />
        <meshBasicMaterial
          color={isActive ? '#F6A9D2' : '#C9B8FF'}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Crystal Glow Light */}
      <pointLight
        ref={lightRef}
        color={isActive ? '#F6A9D2' : '#C9B8FF'}
        intensity={isActive ? 2.5 : 0.8}
        distance={4.5}
        position={[0, 1.4, 0]}
      />
    </group>
  );
};
