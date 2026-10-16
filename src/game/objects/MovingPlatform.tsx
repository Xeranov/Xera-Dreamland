import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider, RapierRigidBody } from '@react-three/rapier';

export interface MovingPlatformProps {
  startPos: [number, number, number];
  endPos: [number, number, number];
  speed?: number; // oscillation speed
  size?: [number, number, number];
  phase?: number;
  color?: string;
  isCloud?: boolean;
}

export const MovingPlatform: React.FC<MovingPlatformProps> = ({
  startPos,
  endPos,
  speed = 0.8,
  size = [3.2, 0.6, 3.2],
  phase = 0,
  color = '#FFFFFF',
  isCloud = true,
}) => {
  const rbRef = useRef<RapierRigidBody>(null);
  const startVec = useRef(new THREE.Vector3(...startPos));
  const endVec = useRef(new THREE.Vector3(...endPos));

  // Smooth cosine wave: starts at startPos when phase=0
  const computeT = (elapsed: number) => {
    return (1 - Math.cos(elapsed * speed + phase)) / 2;
  };

  const initialT = computeT(0);
  const initialPos = useRef(
    new THREE.Vector3().lerpVectors(startVec.current, endVec.current, initialT)
  );
  const currentPos = useRef(initialPos.current.clone());

  useFrame(({ clock }) => {
    if (!rbRef.current) return;
    const t = computeT(clock.getElapsedTime());
    currentPos.current.lerpVectors(startVec.current, endVec.current, t);

    rbRef.current.setNextKinematicTranslation({
      x: currentPos.current.x,
      y: currentPos.current.y,
      z: currentPos.current.z,
    });
  });

  const halfWidth = size[0] / 2;
  const halfHeight = size[1] / 2;
  const halfDepth = size[2] / 2;

  return (
    <RigidBody
      ref={rbRef}
      type="kinematicPosition"
      colliders={false}
      position={[initialPos.current.x, initialPos.current.y, initialPos.current.z]}
      friction={1.0}
    >
      <CuboidCollider args={[halfWidth, halfHeight, halfDepth]} position={[0, halfHeight, 0]} />

      <group position={[0, halfHeight, 0]}>
        {/* Main Platform Body */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={size} />
          <meshStandardMaterial color={color} roughness={0.35} />
        </mesh>

        {isCloud && (
          /* Fluffy Cloud Puffs */
          <group>
            <mesh position={[-halfWidth * 0.9, 0, 0]} scale={[1, 0.9, 1]}>
              <sphereGeometry args={[halfHeight * 1.5, 12, 12]} />
              <meshStandardMaterial color="#FFF7FC" roughness={0.35} />
            </mesh>
            <mesh position={[halfWidth * 0.9, 0, 0]} scale={[1, 0.9, 1]}>
              <sphereGeometry args={[halfHeight * 1.5, 12, 12]} />
              <meshStandardMaterial color="#FFF7FC" roughness={0.35} />
            </mesh>
            <mesh position={[0, 0, -halfDepth * 0.9]} scale={[1, 0.85, 1]}>
              <sphereGeometry args={[halfHeight * 1.4, 12, 12]} />
              <meshStandardMaterial color="#FFF7FC" roughness={0.35} />
            </mesh>
            <mesh position={[0, 0, halfDepth * 0.9]} scale={[1, 0.85, 1]}>
              <sphereGeometry args={[halfHeight * 1.4, 12, 12]} />
              <meshStandardMaterial color="#FFF7FC" roughness={0.35} />
            </mesh>
            {/* Pillowy underside */}
            <mesh position={[0, -halfHeight * 0.6, 0]} scale={[halfWidth * 0.9, halfHeight * 0.9, halfDepth * 0.9]}>
              <sphereGeometry args={[1, 14, 14]} />
              <meshStandardMaterial color="#EAE8F7" roughness={0.4} />
            </mesh>
          </group>
        )}
      </group>
    </RigidBody>
  );
};
