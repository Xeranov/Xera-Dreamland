import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { WorldRoot } from '../game/world/WorldRoot';
import { PlayerPhysics } from '../game/player/PlayerPhysics';
import { CameraController } from '../game/camera/CameraController';
import { useGameInput } from '../hooks/useGameInput';
import { GAME_CONFIG } from '../game/config/game.config';
import { SaveManager } from '../game/systems/SaveManager';

interface GameCanvasProps {
  isPaused: boolean;
}

// Scene Runner running inside Canvas without ANY per-frame React state updates
const SceneRunner: React.FC<{
  isPaused: boolean;
  quality: 'low' | 'medium' | 'high';
}> = ({ isPaused, quality }) => {
  const { getInput } = useGameInput();

  // Shared high-frequency refs between Camera & Physics
  const targetPositionRef = useRef<THREE.Vector3>(
    new THREE.Vector3(...GAME_CONFIG.world.defaultSpawn)
  );
  const cameraYawRef = useRef<number>(Math.PI);

  return (
    <>
      <CameraController
        targetPositionRef={targetPositionRef}
        cameraYawRef={cameraYawRef}
        getInput={getInput}
      />

      <Physics gravity={[0, -19.0, 0]} paused={isPaused}>
        <WorldRoot quality={quality} />
        <PlayerPhysics
          cameraYawRef={cameraYawRef}
          targetPositionRef={targetPositionRef}
          getInput={getInput}
          isPaused={isPaused}
        />
      </Physics>
    </>
  );
};

export const GameCanvas: React.FC<GameCanvasProps> = ({ isPaused }) => {
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>(
    SaveManager.getData().settings.quality || 'medium'
  );

  useEffect(() => {
    return SaveManager.subscribe((data) => {
      setQuality(data.settings.quality || 'medium');
    });
  }, []);

  // Compute adaptive Device Pixel Ratio based on quality tier
  const dprMax = quality === 'low' ? 1.0 : quality === 'medium' ? 1.25 : 1.5;

  return (
    <div className="w-full h-full absolute inset-0 bg-[#FFF4F8]">
      <Canvas
        shadows={quality !== 'low'}
        camera={{
          fov: 48,
          near: 0.1,
          far: 240,
          position: [0, 5, 8],
        }}
        gl={{
          antialias: quality !== 'low',
          toneMapping: THREE.ACESFilmicToneMapping,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        dpr={[1, dprMax]}
      >
        <SceneRunner isPaused={isPaused} quality={quality} />
      </Canvas>
    </div>
  );
};
