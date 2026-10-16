import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CapsuleCollider, useRapier, RapierRigidBody } from '@react-three/rapier';
import { CatCharacter, CatVisualState } from './CatCharacter';
import { GAME_CONFIG } from '../config/game.config';
import { GameState } from '../systems/GameState';
import { SaveManager } from '../systems/SaveManager';
import { AudioManager } from '../systems/AudioManager';

interface PlayerPhysicsProps {
  cameraYawRef: React.MutableRefObject<number>;
  targetPositionRef: React.MutableRefObject<THREE.Vector3>;
  getInput: () => {
    moveX: number;
    moveZ: number;
    jump: boolean;
    dash: boolean;
    interact: boolean;
    meow: boolean;
  };
  isPaused: boolean;
}

export const PlayerPhysics: React.FC<PlayerPhysicsProps> = ({
  cameraYawRef,
  targetPositionRef,
  getInput,
  isPaused,
}) => {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const { rapier, world } = useRapier();

  // Visual & Animation state kept in mutable ref - ZERO React re-renders per frame!
  const visualStateRef = useRef<CatVisualState>({
    animState: 'idle',
    speed: 0,
    isDashing: false,
    facingAngle: 0,
  });

  // Re-render ONLY when equipped accessory changes via inventory
  const [equippedAccessory, setEquippedAccessory] = useState<string | null>(
    SaveManager.getData().equippedAccessory
  );

  useEffect(() => {
    return SaveManager.subscribe((data) => {
      setEquippedAccessory(data.equippedAccessory);
    });
  }, []);

  // Jump & Grounding State Refs
  const isGroundedRef = useRef<boolean>(true);
  const lastGroundedTimeRef = useRef<number>(0);
  const jumpBufferTimeRef = useRef<number>(0);
  const lastJumpTimeRef = useRef<number>(0);

  // Dash State Refs
  const lastDashTimeRef = useRef<number>(-9999);
  const dashActiveUntilRef = useRef<number>(0);
  const dashDirectionRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 1));
  const lastDashNotifyTimeRef = useRef<number>(0);
  const isRespawningRef = useRef<boolean>(false);

  // Footstep Timer
  const footstepAccumulatorRef = useRef<number>(0);

  // Pre-allocated vectors for useFrame to completely eliminate garbage collection spikes
  const forwardVecRef = useRef(new THREE.Vector3());
  const rightVecRef = useRef(new THREE.Vector3());
  const moveDirRef = useRef(new THREE.Vector3());
  const yAxisRef = useRef(new THREE.Vector3(0, 1, 0));

  // External bounce and respawn event listeners
  useEffect(() => {
    const handleBounceEvent = (e: CustomEvent<{ force: number }>) => {
      if (!rigidBodyRef.current) return;
      const force = e.detail?.force || 14.5;
      const currentVel = rigidBodyRef.current.linvel();
      rigidBodyRef.current.setLinvel({ x: currentVel.x, y: force, z: currentVel.z }, true);
      isGroundedRef.current = false;
      visualStateRef.current.animState = 'jump';
      AudioManager.playBounce();
    };

    window.addEventListener('player-bounce' as any, handleBounceEvent);

    const handleRespawnEvent = (e: CustomEvent<{ pos: [number, number, number] }>) => {
      if (!rigidBodyRef.current) return;
      const pos = e.detail?.pos || SaveManager.getData().checkpointPosition;
      rigidBodyRef.current.setTranslation(
        {
          x: pos[0],
          y: pos[1] + 0.5,
          z: pos[2],
        },
        true
      );
      rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      isGroundedRef.current = false;
    };

    window.addEventListener('player-respawn' as any, handleRespawnEvent);

    return () => {
      window.removeEventListener('player-bounce' as any, handleBounceEvent);
      window.removeEventListener('player-respawn' as any, handleRespawnEvent);
    };
  }, []);

  // Set initial spawn
  useEffect(() => {
    const saved = SaveManager.getData();
    if (rigidBodyRef.current) {
      rigidBodyRef.current.setTranslation(
        {
          x: saved.checkpointPosition[0],
          y: saved.checkpointPosition[1],
          z: saved.checkpointPosition[2],
        },
        true
      );
      rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
    }
  }, []);

  useFrame((_, delta) => {
    if (!rigidBodyRef.current) return;

    // Cap delta to prevent physics explosion after tab switch
    const dt = Math.min(delta, 0.05);
    const now = performance.now();

    const input = isPaused
      ? { moveX: 0, moveZ: 0, jump: false, dash: false, interact: false, meow: false }
      : getInput();

    const translation = rigidBodyRef.current.translation();
    const linvel = rigidBodyRef.current.linvel();

    // Update shared player position directly on ref - zero React re-render
    targetPositionRef.current.set(translation.x, translation.y, translation.z);

    // Fall Check & Respawn
    if (translation.y < GAME_CONFIG.world.fallThresholdY) {
      const saved = SaveManager.getData();
      rigidBodyRef.current.setTranslation(
        {
          x: saved.checkpointPosition[0],
          y: saved.checkpointPosition[1] + 0.5,
          z: saved.checkpointPosition[2],
        },
        true
      );
      rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);

      if (!isRespawningRef.current) {
        isRespawningRef.current = true;
        AudioManager.playLand();
        requestAnimationFrame(() => {
          GameState.showBanner('Oops! Respawned at checkpoint 🐾');
          setTimeout(() => {
            isRespawningRef.current = false;
          }, 1200);
        });
      }
      return;
    }

    // 1. Raycast Ground Detection
    // Do not detect ground while ascending during the first 180ms of a jump
    const isActivelyAscendingJump = now - lastJumpTimeRef.current < 180;
    const rayOrigin = { x: translation.x, y: translation.y + 0.1, z: translation.z };
    const rayDir = { x: 0, y: -1, z: 0 };
    const maxToi = 0.55; // Distance to floor
    const ray = new rapier.Ray(rayOrigin, rayDir);
    const hit = isActivelyAscendingJump
      ? null
      : world.castRay(
          ray,
          maxToi,
          true,
          undefined,
          undefined,
          rigidBodyRef.current.collider(0)
        );

    const wasGrounded = isGroundedRef.current;
    const isNowGrounded = !isActivelyAscendingJump && hit !== null && hit.timeOfImpact <= maxToi;
    isGroundedRef.current = isNowGrounded;

    if (isNowGrounded) {
      lastGroundedTimeRef.current = now;
      if (!wasGrounded && linvel.y < -1.5) {
        AudioManager.playLand();
        visualStateRef.current.animState = 'land';
        setTimeout(() => {
          if (visualStateRef.current.animState === 'land') {
            visualStateRef.current.animState = 'idle';
          }
        }, 120);
      }
    }

    // Kinematic moving platform velocity calculation
    let groundVel = { x: 0, y: 0, z: 0 };
    let isKinematicGround = false;

    if (isNowGrounded && hit) {
      const groundRb = hit.collider.parent();
      if (groundRb && groundRb.isKinematic()) {
        isKinematicGround = true;
        groundVel = groundRb.linvel();
      }
    }

    // 2. Dash Cooldown & State
    const timeSinceDash = now - lastDashTimeRef.current;
    const dashCooldownProgress = Math.min(1, timeSinceDash / GAME_CONFIG.player.dashCooldownMs);

    // Throttle HUD dash notifications to 10Hz or on completion to prevent React render churn
    if (now - lastDashNotifyTimeRef.current > 100 || dashCooldownProgress >= 1) {
      lastDashNotifyTimeRef.current = now;
      GameState.setDashCooldown(dashCooldownProgress);
    }

    const isDashActive = now < dashActiveUntilRef.current;
    visualStateRef.current.isDashing = isDashActive;

    // Check Dash Trigger
    if (input.dash && dashCooldownProgress >= 1 && !isDashActive) {
      lastDashTimeRef.current = now;
      dashActiveUntilRef.current = now + GAME_CONFIG.player.dashDurationMs;

      // Determine FORWARD dash direction (relative to camera or cat facing)
      if (Math.abs(input.moveX) > 0.05 || Math.abs(input.moveZ) > 0.05) {
        // Dash in the current camera-relative input direction
        forwardVecRef.current.set(0, 0, -1).applyAxisAngle(yAxisRef.current, cameraYawRef.current);
        rightVecRef.current.set(1, 0, 0).applyAxisAngle(yAxisRef.current, cameraYawRef.current);
        dashDirectionRef.current
          .copy(forwardVecRef.current)
          .multiplyScalar(input.moveZ)
          .addScaledVector(rightVecRef.current, input.moveX)
          .normalize();
      } else {
        // Dash forward in the direction the cat is currently facing
        const currentFacing = visualStateRef.current.facingAngle;
        dashDirectionRef.current
          .set(Math.sin(currentFacing), 0, Math.cos(currentFacing))
          .normalize();
      }

      // Turn visual model to face the dash direction
      visualStateRef.current.facingAngle = Math.atan2(
        dashDirectionRef.current.x,
        dashDirectionRef.current.z
      );

      AudioManager.playDash();
    }

    // 3. Jump Buffering & Coyote Time
    if (input.jump) {
      jumpBufferTimeRef.current = now;
    }

    const hasJumpBuffered = now - jumpBufferTimeRef.current < GAME_CONFIG.player.jumpBufferMs;
    const withinCoyoteTime = now - lastGroundedTimeRef.current < GAME_CONFIG.player.coyoteTimeMs;
    const canJump = hasJumpBuffered && withinCoyoteTime && now - lastJumpTimeRef.current > 250;

    let targetVelY = linvel.y;

    if (canJump) {
      lastJumpTimeRef.current = now;
      jumpBufferTimeRef.current = 0; // consume buffer
      lastGroundedTimeRef.current = 0; // consume coyote
      targetVelY = GAME_CONFIG.player.jumpImpulse + (isKinematicGround && groundVel.y > 0 ? groundVel.y : 0);
      AudioManager.playJump();
      visualStateRef.current.animState = 'jump';
    } else if (isKinematicGround && now - lastJumpTimeRef.current > 250 && linvel.y <= 0.1) {
      // Firmly anchor the cat to vertical elevators ONLY when descending or resting (NOT while jumping up!)
      targetVelY = groundVel.y;
    }

    // 4. Horizontal Locomotion (Relative to Camera Yaw)
    let targetVelX = 0;
    let targetVelZ = 0;

    if (isDashActive) {
      targetVelX = dashDirectionRef.current.x * GAME_CONFIG.player.dashSpeed;
      targetVelZ = dashDirectionRef.current.z * GAME_CONFIG.player.dashSpeed;
    } else {
      const hasInput = Math.abs(input.moveX) > 0.05 || Math.abs(input.moveZ) > 0.05;

      if (hasInput) {
        forwardVecRef.current.set(0, 0, -1).applyAxisAngle(yAxisRef.current, cameraYawRef.current);
        rightVecRef.current.set(1, 0, 0).applyAxisAngle(yAxisRef.current, cameraYawRef.current);

        moveDirRef.current
          .copy(forwardVecRef.current)
          .multiplyScalar(input.moveZ)
          .addScaledVector(rightVecRef.current, input.moveX)
          .normalize();

        targetVelX = moveDirRef.current.x * GAME_CONFIG.player.maxSpeed;
        targetVelZ = moveDirRef.current.z * GAME_CONFIG.player.maxSpeed;

        // Facing direction target
        visualStateRef.current.facingAngle = Math.atan2(moveDirRef.current.x, moveDirRef.current.z);
      }
    }

    // Add ground momentum to desired horizontal velocity
    const desiredVelX = targetVelX + groundVel.x;
    const desiredVelZ = targetVelZ + groundVel.z;

    // Acceleration & Air Control Dampening
    const accelRate = isNowGrounded
      ? GAME_CONFIG.player.acceleration
      : GAME_CONFIG.player.acceleration * GAME_CONFIG.player.airControl;

    const newVelX = THREE.MathUtils.lerp(linvel.x, desiredVelX, Math.min(1, accelRate * dt));
    const newVelZ = THREE.MathUtils.lerp(linvel.z, desiredVelZ, Math.min(1, accelRate * dt));

    // Apply linvel to rigid body
    rigidBodyRef.current.setLinvel({ x: newVelX, y: targetVelY, z: newVelZ }, true);

    // Calculate current horizontal speed relative to ground for animations
    const relVelX = newVelX - groundVel.x;
    const relVelZ = newVelZ - groundVel.z;
    const horizSpeed = Math.sqrt(relVelX * relVelX + relVelZ * relVelZ);
    visualStateRef.current.speed = horizSpeed;

    // 5. Animation State Resolution
    if (!isDashActive) {
      if (!isNowGrounded) {
        visualStateRef.current.animState = targetVelY > 0.8 ? 'jump' : 'fall';
      } else if (horizSpeed > 4.5) {
        visualStateRef.current.animState = 'run';
      } else if (horizSpeed > 0.3) {
        visualStateRef.current.animState = 'walk';
      } else if (visualStateRef.current.animState !== 'land') {
        visualStateRef.current.animState = 'idle';
      }
    }

    // Footstep audio timing when grounded and moving
    if (isNowGrounded && horizSpeed > 0.5) {
      footstepAccumulatorRef.current += dt * (horizSpeed > 4.5 ? 4.5 : 3.0);
      if (footstepAccumulatorRef.current >= 1.0) {
        footstepAccumulatorRef.current = 0;
        AudioManager.playFootstep();
      }
    }
  });

  return (
    <RigidBody
      ref={rigidBodyRef}
      colliders={false}
      type="dynamic"
      position={GAME_CONFIG.world.defaultSpawn}
      enabledRotations={[false, false, false]}
      friction={0.2}
      restitution={0.0}
      linearDamping={0.5}
      mass={1.2}
    >
      <CapsuleCollider
        args={[GAME_CONFIG.player.colliderHeight / 2, GAME_CONFIG.player.colliderRadius]}
        position={[0, 0.38, 0]}
      />
      <CatCharacter
        visualStateRef={visualStateRef}
        equippedAccessory={equippedAccessory}
      />
    </RigidBody>
  );
};
