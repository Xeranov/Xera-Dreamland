import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { GAME_CONFIG } from '../config/game.config';
import { SaveManager } from '../systems/SaveManager';

interface CameraControllerProps {
  targetPosition: THREE.Vector3;
  deltaX: number;
  deltaY: number;
  zoomDelta: number;
  onYawChange: (yaw: number) => void;
}

export const CameraController: React.FC<CameraControllerProps> = ({
  targetPosition,
  deltaX,
  deltaY,
  zoomDelta,
  onYawChange,
}) => {
  const { camera } = useThree();

  // Spherical orbit parameters
  const yawRef = useRef<number>(Math.PI); // Facing forward along Z
  const pitchRef = useRef<number>(0.28); // Slightly elevated angle
  const distanceRef = useRef<number>(GAME_CONFIG.camera.defaultDistance);

  // Smoothed camera position
  const currentPosRef = useRef<THREE.Vector3>(
    new THREE.Vector3(
      targetPosition.x,
      targetPosition.y + 2.5,
      targetPosition.z + GAME_CONFIG.camera.defaultDistance
    )
  );
  const lookAtPosRef = useRef<THREE.Vector3>(
    new THREE.Vector3(targetPosition.x, targetPosition.y + 0.6, targetPosition.z)
  );

  useFrame((_, delta) => {
    const settings = SaveManager.getData().settings;
    const sensitivity = (settings.sensitivity || 1.0) * 0.0035;

    // Apply rotation deltas
    if (deltaX !== 0 || deltaY !== 0) {
      yawRef.current -= deltaX * sensitivity;
      pitchRef.current += deltaY * sensitivity;

      // Clamp pitch to avoid ground clipping or upside-down flips
      pitchRef.current = Math.max(
        GAME_CONFIG.camera.minPitch,
        Math.min(GAME_CONFIG.camera.maxPitch, pitchRef.current)
      );

      onYawChange(yawRef.current);
    }

    // Apply zoom
    if (zoomDelta !== 0) {
      distanceRef.current += zoomDelta;
      distanceRef.current = Math.max(
        GAME_CONFIG.camera.minDistance,
        Math.min(GAME_CONFIG.camera.maxDistance, distanceRef.current)
      );
    }

    // Target look-at position (focused on cat's chest/head)
    const targetLookAt = new THREE.Vector3(
      targetPosition.x,
      targetPosition.y + 0.6,
      targetPosition.z
    );

    // Compute ideal camera position in spherical coordinates relative to targetLookAt
    const cosPitch = Math.cos(pitchRef.current);
    const sinPitch = Math.sin(pitchRef.current);
    const sinYaw = Math.sin(yawRef.current);
    const cosYaw = Math.cos(yawRef.current);

    const idealCamPos = new THREE.Vector3(
      targetLookAt.x + distanceRef.current * cosPitch * sinYaw,
      targetLookAt.y + distanceRef.current * sinPitch,
      targetLookAt.z + distanceRef.current * cosPitch * cosYaw
    );

    // Smoothing factor (if reducedMotion, follow slightly quicker to minimize sway)
    const smooth = settings.reducedMotion ? 0.35 : GAME_CONFIG.camera.smoothFactor;
    const lerpFactor = Math.min(1, delta * 60 * smooth);

    currentPosRef.current.lerp(idealCamPos, lerpFactor);
    lookAtPosRef.current.lerp(targetLookAt, lerpFactor);

    camera.position.copy(currentPosRef.current);
    camera.lookAt(lookAtPosRef.current);
  });

  return null;
};
