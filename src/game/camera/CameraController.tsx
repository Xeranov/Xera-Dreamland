import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { GAME_CONFIG } from '../config/game.config';
import { SaveManager } from '../systems/SaveManager';

interface CameraControllerProps {
  targetPositionRef: React.MutableRefObject<THREE.Vector3>;
  cameraYawRef: React.MutableRefObject<number>;
  getInput: () => {
    cameraDeltaX: number;
    cameraDeltaY: number;
    cameraZoomDelta: number;
  };
}

export const CameraController: React.FC<CameraControllerProps> = ({
  targetPositionRef,
  cameraYawRef,
  getInput,
}) => {
  const { camera } = useThree();

  // Spherical orbit parameters
  const yawRef = useRef<number>(Math.PI); // Facing forward along Z
  const pitchRef = useRef<number>(0.28); // Slightly elevated angle
  const distanceRef = useRef<number>(GAME_CONFIG.camera.defaultDistance);

  // Pre-allocated vectors to completely eliminate Garbage Collection churn per frame
  const currentPosRef = useRef<THREE.Vector3>(
    new THREE.Vector3(
      targetPositionRef.current.x,
      targetPositionRef.current.y + 2.5,
      targetPositionRef.current.z + GAME_CONFIG.camera.defaultDistance
    )
  );
  const lookAtPosRef = useRef<THREE.Vector3>(
    new THREE.Vector3(
      targetPositionRef.current.x,
      targetPositionRef.current.y + 0.6,
      targetPositionRef.current.z
    )
  );
  const targetLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const idealCamPosRef = useRef<THREE.Vector3>(new THREE.Vector3());

  useFrame((_, delta) => {
    const input = getInput();
    const settings = SaveManager.getData().settings;
    const sensitivity = (settings.sensitivity || 1.0) * 0.0035;

    // Apply rotation deltas
    if (input.cameraDeltaX !== 0 || input.cameraDeltaY !== 0) {
      yawRef.current -= input.cameraDeltaX * sensitivity;
      pitchRef.current += input.cameraDeltaY * sensitivity;

      // Clamp pitch to avoid ground clipping or upside-down flips
      pitchRef.current = Math.max(
        GAME_CONFIG.camera.minPitch,
        Math.min(GAME_CONFIG.camera.maxPitch, pitchRef.current)
      );

      cameraYawRef.current = yawRef.current;
    }

    // Apply zoom
    if (input.cameraZoomDelta !== 0) {
      distanceRef.current += input.cameraZoomDelta;
      distanceRef.current = Math.max(
        GAME_CONFIG.camera.minDistance,
        Math.min(GAME_CONFIG.camera.maxDistance, distanceRef.current)
      );
    }

    // Target look-at position (focused on cat's chest/head)
    const targetPos = targetPositionRef.current;
    targetLookAtRef.current.set(targetPos.x, targetPos.y + 0.6, targetPos.z);

    // Compute ideal camera position in spherical coordinates relative to targetLookAt
    const cosPitch = Math.cos(pitchRef.current);
    const sinPitch = Math.sin(pitchRef.current);
    const sinYaw = Math.sin(yawRef.current);
    const cosYaw = Math.cos(yawRef.current);

    idealCamPosRef.current.set(
      targetLookAtRef.current.x + distanceRef.current * cosPitch * sinYaw,
      targetLookAtRef.current.y + distanceRef.current * sinPitch,
      targetLookAtRef.current.z + distanceRef.current * cosPitch * cosYaw
    );

    // Smoothing factor (if reducedMotion, follow slightly quicker to minimize sway)
    const smooth = settings.reducedMotion ? 0.35 : GAME_CONFIG.camera.smoothFactor;
    const lerpFactor = Math.min(1, delta * 60 * smooth);

    currentPosRef.current.lerp(idealCamPosRef.current, lerpFactor);
    lookAtPosRef.current.lerp(targetLookAtRef.current, lerpFactor);

    camera.position.copy(currentPosRef.current);
    camera.lookAt(lookAtPosRef.current);
  });

  return null;
};
