import React from 'react';
import { SakuraMeadow } from './islands/SakuraMeadow';
import { CandyGarden } from './zones/CandyGarden';
import { CloudBridges } from './zones/CloudBridges';
import { StarlightShrine } from './zones/StarlightShrine';
import { HiddenGrove } from './zones/HiddenGrove';
import { CherryPetals } from './environment/CherryPetals';
import { CloudDecor } from './environment/CloudDecor';

export const WorldRoot: React.FC = () => {
  return (
    <group>
      {/* Dreamland Atmospheric Pastel Fog */}
      <color attach="background" args={['#FFF4F8']} />
      <fog attach="fog" args={['#FFF4F8', 35, 140]} />

      {/* Lighting Rig */}
      <ambientLight color="#FFF0F5" intensity={0.85} />

      <directionalLight
        position={[25, 42, 20]}
        color="#FFF8E7"
        intensity={1.35}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={120}
        shadow-camera-left={-45}
        shadow-camera-right={45}
        shadow-camera-top={45}
        shadow-camera-bottom={-45}
        shadow-bias={-0.0003}
      />

      {/* Soft Sky & Ground Bounce Fill */}
      <hemisphereLight args={['#B9E5FF', '#FFF4F8', 0.55]} />

      {/* Seamless Archipelago Zones */}
      <SakuraMeadow />
      <CandyGarden />
      <CloudBridges />
      <StarlightShrine />
      <HiddenGrove />

      {/* Atmosphere & Ambient Particle Decor */}
      <CherryPetals count={95} />
      <CloudDecor />
    </group>
  );
};
