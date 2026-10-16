import React from 'react';
import { RigidBody } from '@react-three/rapier';

interface PushableBoxProps {
  position: [number, number, number];
  size?: [number, number, number];
  color?: string;
  shape?: 'box' | 'ball';
}

export const PushableBox: React.FC<PushableBoxProps> = ({
  position,
  size = [0.8, 0.8, 0.8],
  color = '#BFEBD8',
  shape = 'box',
}) => {
  if (shape === 'ball') {
    const radius = size[0] / 2;
    return (
      <RigidBody
        colliders="ball"
        type="dynamic"
        position={position}
        mass={0.6}
        friction={0.4}
        restitution={0.6}
        linearDamping={0.4}
        angularDamping={0.3}
      >
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[radius, 24, 24]} />
          <meshStandardMaterial
            color={color}
            roughness={0.2}
            metalness={0.05}
          />
        </mesh>
        {/* Decorative candy swirl stripe */}
        <mesh rotation={[Math.PI / 4, 0, 0]} scale={[1.01, 1.01, 1.01]}>
          <torusGeometry args={[radius * 0.88, radius * 0.12, 12, 32]} />
          <meshStandardMaterial color="#FFF4F8" roughness={0.2} />
        </mesh>
      </RigidBody>
    );
  }

  return (
    <RigidBody
      colliders="cuboid"
      type="dynamic"
      position={position}
      mass={0.8}
      friction={0.5}
      restitution={0.2}
      linearDamping={0.5}
      angularDamping={0.4}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial
          color={color}
          roughness={0.25}
          metalness={0.05}
        />
      </mesh>
      {/* Decorative Ribbon Cross */}
      <mesh position={[0, 0, 0]} scale={[1.005, 1.005, 0.25]}>
        <boxGeometry args={size} />
        <meshStandardMaterial color="#FFF4F8" roughness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0]} scale={[0.25, 1.005, 1.005]}>
        <boxGeometry args={size} />
        <meshStandardMaterial color="#FFF4F8" roughness={0.3} />
      </mesh>
    </RigidBody>
  );
};
