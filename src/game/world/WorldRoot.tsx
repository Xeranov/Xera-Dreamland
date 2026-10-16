import React from 'react';
import { SakuraMeadow } from './islands/SakuraMeadow';
import { CherryPetals } from './environment/CherryPetals';
import { CloudDecor } from './environment/CloudDecor';

export const WorldRoot: React.FC = () => {
  return (
    <group>
      {/* Dreamland Atmospheric Pastel Fog */}
      <color attach="background" args={['#FFF4F8']} />
      <fog attach="fog" args={['#FFF4F8', 18, 52]} />

      {/* Lighting Rig */}
      <ambientLight color="#FFF0F5" intensity={0.8} />

      <directionalLight
        position={[14, 22, 12]}
        color="#FFF8E7"
        intensity={1.3}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={60}
        shadow-camera-left={-22}
        shadow-camera-right={22}
        shadow-camera-top={22}
        shadow-camera-bottom={-22}
        shadow-bias={-0.0003}
      />

      {/* Soft Sky & Ground Bounce Fill */}
      <hemisphereLight
        args={['#B9E5FF', '#FFF4F8', 0.5]}
      />

      {/* World Objects */}
      <SakuraMeadow />
      <CherryPetals count={85} />
      <CloudDecor />
    </group>
  );
};
