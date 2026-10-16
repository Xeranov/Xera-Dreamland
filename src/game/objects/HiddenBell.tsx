import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { RigidBody, BallCollider } from '@react-three/rapier';
import { SaveManager } from '../systems/SaveManager';
import { AudioManager } from '../systems/AudioManager';
import { GameState } from '../systems/GameState';

interface HiddenBellProps {
  id: string;
  position: [number, number, number];
  name?: string;
}

export const HiddenBell: React.FC<HiddenBellProps> = ({ id, position, name = 'Hidden Bell' }) => {
  const isInitiallyCollected = SaveManager.isBellCollected(id);
  const [collected, setCollected] = useState<boolean>(isInitiallyCollected);
  const bellGroupRef = useRef<THREE.Group>(null);
  const animTimeRef = useRef<number>(Math.random() * 10);

  useFrame((_, delta) => {
    if (collected || !bellGroupRef.current) return;
    animTimeRef.current += delta;
    const t = animTimeRef.current;

    // Gentle floating bob & sway
    bellGroupRef.current.position.y = Math.sin(t * 2.2) * 0.14;
    bellGroupRef.current.rotation.y += delta * 1.5;
    bellGroupRef.current.rotation.z = Math.sin(t * 1.8) * 0.12;
  });

  const handleIntersection = () => {
    if (collected) return;
    const wasCollected = SaveManager.collectBell(id);
    if (wasCollected) {
      setCollected(true);
      AudioManager.playBellChime();
      const count = SaveManager.getData().collectedBellIds.length;
      if (count === 3) {
        GameState.showBanner('🔔 Hidden Bell found! (3/8) 🌸 Sakura Flower Pin Unlocked! [I]', 4000);
      } else if (count === 6) {
        GameState.showBanner('🔔 Hidden Bell found! (6/8) 🎀 Pink Ribbon Bow Unlocked! [I]', 4000);
      } else if (count === 8) {
        GameState.showBanner('🔔 All 8 Hidden Bells found! You are a master explorer! 🐾', 4000);
      } else {
        GameState.showBanner(`🔔 ${name} discovered! (${count}/8)`, 2600);
      }
    }
  };

  if (collected) return null;

  return (
    <group position={position}>
      {/* Sensor Trigger */}
      <RigidBody type="fixed" colliders={false} sensor onIntersectionEnter={handleIntersection}>
        <BallCollider args={[0.75]} />
      </RigidBody>

      <group ref={bellGroupRef}>
        {/* Main Golden Bell Dome */}
        <mesh castShadow position={[0, 0.22, 0]}>
          <cylinderGeometry args={[0.12, 0.28, 0.38, 20]} />
          <meshStandardMaterial
            color="#FCD34D"
            emissive="#FFB800"
            emissiveIntensity={0.35}
            roughness={0.2}
            metalness={0.85}
          />
        </mesh>

        {/* Bell Flared Rim */}
        <mesh castShadow position={[0, 0.05, 0]}>
          <torusGeometry args={[0.26, 0.04, 12, 24]} />
          <meshStandardMaterial
            color="#FFE57F"
            emissive="#FFA000"
            emissiveIntensity={0.3}
            roughness={0.18}
            metalness={0.9}
          />
        </mesh>

        {/* Bell Clapper */}
        <mesh castShadow position={[0, -0.04, 0]}>
          <sphereGeometry args={[0.07, 14, 14]} />
          <meshStandardMaterial color="#E69500" roughness={0.3} metalness={0.8} />
        </mesh>

        {/* Golden Top Suspension Loop */}
        <mesh castShadow position={[0, 0.44, 0]}>
          <torusGeometry args={[0.08, 0.025, 8, 16]} />
          <meshStandardMaterial color="#FCD34D" roughness={0.2} metalness={0.85} />
        </mesh>

        {/* Decorative Cute Pink Bow on Top */}
        <group position={[0, 0.43, 0.08]}>
          <mesh scale={[0.14, 0.07, 0.05]}>
            <sphereGeometry args={[1, 10, 10]} />
            <meshStandardMaterial color="#F6A9D2" roughness={0.3} />
          </mesh>
          <mesh position={[-0.11, 0.02, 0]} rotation={[0, 0, 0.4]} scale={[0.1, 0.06, 0.04]}>
            <sphereGeometry args={[1, 10, 10]} />
            <meshStandardMaterial color="#FFAEC9" roughness={0.3} />
          </mesh>
          <mesh position={[0.11, 0.02, 0]} rotation={[0, 0, -0.4]} scale={[0.1, 0.06, 0.04]}>
            <sphereGeometry args={[1, 10, 10]} />
            <meshStandardMaterial color="#FFAEC9" roughness={0.3} />
          </mesh>
        </group>

        {/* Radiance Point Light */}
        <pointLight color="#FFE58F" intensity={1.8} distance={3.8} />
      </group>
    </group>
  );
};
