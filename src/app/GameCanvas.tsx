import React, { useState, useRef } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { WorldRoot } from '../game/world/WorldRoot';
import { PlayerPhysics } from '../game/player/PlayerPhysics';
import { CameraController } from '../game/camera/CameraController';
import { useGameInput } from '../hooks/useGameInput';
import { GAME_CONFIG } from '../game/config/game.config';

interface GameCanvasProps {
  isPaused: boolean;
}

// Scene Runner running inside Canvas
const SceneRunner: React.FC<{ isPaused: boolean }> = ({ isPaused }) => {
  const { getInput } = useGameInput();
  const [playerPos, setPlayerPos] = useState<THREE.Vector3>(
    new THREE.Vector3(...GAME_CONFIG.world.defaultSpawn)
  );
  const cameraYawRef = useRef<number>(Math.PI);

  const input = isPaused
    ? {
        moveX: 0,
        moveZ: 0,
        jump: false,
        dash: false,
        interact: false,
        meow: false,
        cameraDeltaX: 0,
        cameraDeltaY: 0,
        cameraZoomDelta: 0,
      }
    : getInput();

  return (
    <>
      <CameraController
        targetPosition={playerPos}
        deltaX={input.cameraDeltaX}
        deltaY={input.cameraDeltaY}
        zoomDelta={input.cameraZoomDelta}
        onYawChange={(yaw) => {
          cameraYawRef.current = yaw;
        }}
      />

      <Physics gravity={[0, -19.0, 0]} paused={isPaused}>
        <WorldRoot />
        <PlayerPhysics
          cameraYaw={cameraYawRef.current}
          input={input}
          onPositionUpdate={(pos) => {
            setPlayerPos(pos.clone());
          }}
        />
      </Physics>
    </>
  );
};

export const GameCanvas: React.FC<GameCanvasProps> = ({ isPaused }) => {
  return (
    <div className="w-full h-full absolute inset-0 bg-[#FFF4F8]">
      <Canvas
        shadows
        camera={{
          fov: 48,
          near: 0.1,
          far: 120,
          position: [0, 5, 8],
        }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}
      >
        <SceneRunner isPaused={isPaused} />
      </Canvas>
    </div>
  );
};
