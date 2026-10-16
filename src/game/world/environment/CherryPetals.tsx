import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

export const CherryPetals: React.FC<{ count?: number }> = ({ count = 90 }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Generate random initial positions & rotation speeds
  const particles = useMemo(() => {
    return Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 36,
      y: 2 + Math.random() * 12,
      z: (Math.random() - 0.5) * 36,
      rotX: Math.random() * Math.PI,
      rotY: Math.random() * Math.PI,
      rotZ: Math.random() * Math.PI,
      speedY: 0.6 + Math.random() * 0.7,
      swaySpeed: 1.2 + Math.random() * 1.5,
      swayRadius: 0.3 + Math.random() * 0.4,
      scale: 0.08 + Math.random() * 0.07,
    }));
  }, [count]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const t = performance.now() * 0.001;

    particles.forEach((p, i) => {
      // Fall downwards
      p.y -= p.speedY * delta;
      // Sway in wind
      const swayX = Math.sin(t * p.swaySpeed + i) * p.swayRadius;
      const swayZ = Math.cos(t * p.swaySpeed * 0.8 + i) * p.swayRadius;

      // Wrap around when falling through floor
      if (p.y < -3) {
        p.y = 12 + Math.random() * 3;
        p.x = (Math.random() - 0.5) * 36;
        p.z = (Math.random() - 0.5) * 36;
      }

      dummy.position.set(p.x + swayX, p.y, p.z + swayZ);
      dummy.rotation.set(
        p.rotX + t * 0.5,
        p.rotY + t * 0.8,
        p.rotZ + t * 0.3
      );
      dummy.scale.set(p.scale, p.scale * 0.5, p.scale);
      dummy.updateMatrix();
      meshRef.current?.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, count]}
      frustumCulled={false}
    >
      <planeGeometry args={[1, 1]} />
      <meshStandardMaterial
        color="#F6A9D2"
        roughness={0.4}
        side={THREE.DoubleSide}
        transparent
        opacity={0.85}
      />
    </instancedMesh>
  );
};
