import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CylinderCollider } from '@react-three/rapier';

interface BounceMushroomProps {
  position: [number, number, number];
  bounceForce?: number;
}

export const BounceMushroom: React.FC<BounceMushroomProps> = ({
  position,
  bounceForce = 15.5,
}) => {
  const capRef = useRef<THREE.Group>(null);
  const [squash, setSquash] = useState<number>(1);
  const squashVelRef = useRef<number>(0);

  const handleBounce = () => {
    // Dispatch bounce event to PlayerPhysics
    window.dispatchEvent(
      new CustomEvent('player-bounce', { detail: { force: bounceForce } })
    );

    // Initial squash kick
    setSquash(0.45);
    squashVelRef.current = 4.0;
  };

  useFrame((_, delta) => {
    if (!capRef.current) return;
    const dt = Math.min(delta, 0.05);

    // Spring physics back to 1.0
    if (squash !== 1 || squashVelRef.current !== 0) {
      const tension = 120;
      const damping = 12;
      const displacement = squash - 1.0;
      const force = -tension * displacement - damping * squashVelRef.current;
      squashVelRef.current += force * dt;
      const nextSquash = Math.max(0.3, Math.min(1.4, squash + squashVelRef.current * dt));

      if (Math.abs(nextSquash - 1) < 0.01 && Math.abs(squashVelRef.current) < 0.05) {
        setSquash(1);
        squashVelRef.current = 0;
      } else {
        setSquash(nextSquash);
      }

      capRef.current.scale.set(1.0 / Math.sqrt(squash), squash, 1.0 / Math.sqrt(squash));
      capRef.current.position.y = 0.55 * squash;
    }
  });

  return (
    <group position={position}>
      {/* Base Solid Collider for Mushroom Stem */}
      <RigidBody type="fixed" colliders={false}>
        <CylinderCollider args={[0.35, 0.35]} position={[0, 0.35, 0]} />
      </RigidBody>

      {/* Top Bounce Sensor Collider */}
      <RigidBody type="fixed" colliders={false} sensor onIntersectionEnter={handleBounce}>
        <CylinderCollider args={[0.25, 0.75]} position={[0, 0.8, 0]} />
      </RigidBody>

      {/* Stem Mesh */}
      <mesh castShadow receiveShadow position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.22, 0.32, 0.5, 16]} />
        <meshStandardMaterial color="#FFF9FA" roughness={0.3} />
      </mesh>

      {/* Springy Bouncy Cap */}
      <group ref={capRef} position={[0, 0.55, 0]}>
        {/* Main Mushroom Cap (Hemisphere) */}
        <mesh castShadow receiveShadow position={[0, 0, 0]}>
          <sphereGeometry args={[0.7, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <meshStandardMaterial
            color="#F6A9D2"
            roughness={0.18}
            metalness={0.08}
          />
        </mesh>

        {/* Cap Underside */}
        <mesh position={[0, -0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.68, 24]} />
          <meshStandardMaterial color="#FFE6F0" roughness={0.4} />
        </mesh>

        {/* Polka Dot 1 */}
        <mesh position={[0, 0.52, 0.35]} rotation={[0.6, 0, 0]}>
          <circleGeometry args={[0.13, 12]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
        </mesh>

        {/* Polka Dot 2 */}
        <mesh position={[-0.38, 0.38, 0.25]} rotation={[0.5, -0.6, 0]}>
          <circleGeometry args={[0.11, 12]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
        </mesh>

        {/* Polka Dot 3 */}
        <mesh position={[0.38, 0.38, 0.25]} rotation={[0.5, 0.6, 0]}>
          <circleGeometry args={[0.11, 12]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
        </mesh>

        {/* Polka Dot 4 (Back) */}
        <mesh position={[0, 0.45, -0.4]} rotation={[-0.6, 0, 0]}>
          <circleGeometry args={[0.12, 12]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
        </mesh>
      </group>
    </group>
  );
};
