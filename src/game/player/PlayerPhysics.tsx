import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CapsuleCollider, useRapier, RapierRigidBody } from '@react-three/rapier';
import { CatCharacter, CatAnimState } from './CatCharacter';
import { GAME_CONFIG } from '../config/game.config';
import { GameState } from '../systems/GameState';
import { SaveManager } from '../systems/SaveManager';
import { AudioManager } from '../systems/AudioManager';

interface PlayerPhysicsProps {
  cameraYaw: number;
  input: {
    moveX: number;
    moveZ: number;
    jump: boolean;
    dash: boolean;
    interact: boolean;
    meow: boolean;
  };
  onPositionUpdate?: (pos: THREE.Vector3) => void;
}

export const PlayerPhysics: React.FC<PlayerPhysicsProps> = ({
  cameraYaw,
  input,
  onPositionUpdate,
}) => {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const { rapier, world } = useRapier();

  // Animations & Visual State
  const [animState, setAnimState] = useState<CatAnimState>('idle');
  const [facingAngle, setFacingAngle] = useState<number>(0);
  const [currentSpeed, setCurrentSpeed] = useState<number>(0);
  const [isDashing, setIsDashing] = useState<boolean>(false);
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

  // Footstep Timer
  const footstepAccumulatorRef = useRef<number>(0);

  // External bounce trigger listener
  useEffect(() => {
    const handleBounceEvent = (e: CustomEvent<{ force: number }>) => {
      if (!rigidBodyRef.current) return;
      const force = e.detail?.force || 14.5;
      const currentVel = rigidBodyRef.current.linvel();
      rigidBodyRef.current.setLinvel({ x: currentVel.x, y: force, z: currentVel.z }, true);
      isGroundedRef.current = false;
      setAnimState('jump');
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

    const translation = rigidBodyRef.current.translation();
    const linvel = rigidBodyRef.current.linvel();
    const playerPos = new THREE.Vector3(translation.x, translation.y, translation.z);

    // Notify camera & other systems of current position
    onPositionUpdate?.(playerPos);

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
      GameState.showBanner('Oops! Respawned at checkpoint 🐾');
      AudioManager.playLand();
      return;
    }

    // 1. Raycast Ground Detection
    const rayOrigin = { x: translation.x, y: translation.y + 0.1, z: translation.z };
    const rayDir = { x: 0, y: -1, z: 0 };
    const maxToi = 0.55; // Distance to floor
    const ray = new rapier.Ray(rayOrigin, rayDir);
    const hit = world.castRay(
      ray,
      maxToi,
      true,
      undefined,
      undefined,
      rigidBodyRef.current.collider(0)
    );

    const wasGrounded = isGroundedRef.current;
    const isNowGrounded = hit !== null && hit.timeOfImpact <= maxToi;
    isGroundedRef.current = isNowGrounded;

    if (isNowGrounded) {
      lastGroundedTimeRef.current = now;
      if (!wasGrounded && linvel.y < -1.5) {
        // Landing sound and squash
        AudioManager.playLand();
        setAnimState('land');
        setTimeout(() => {
          setAnimState('idle');
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
    GameState.setDashCooldown(dashCooldownProgress);

    const isDashActive = now < dashActiveUntilRef.current;
    setIsDashing(isDashActive);

    // Check Dash Trigger
    if (input.dash && dashCooldownProgress >= 1 && !isDashActive) {
      lastDashTimeRef.current = now;
      dashActiveUntilRef.current = now + GAME_CONFIG.player.dashDurationMs;

      // Determine dash direction
      let dashDir = new THREE.Vector3(
        -Math.sin(facingAngle),
        0,
        -Math.cos(facingAngle)
      ).normalize();

      if (input.moveX !== 0 || input.moveZ !== 0) {
        const inputAngle = Math.atan2(input.moveX, input.moveZ) + cameraYaw;
        dashDir.set(Math.sin(inputAngle), 0, Math.cos(inputAngle)).normalize();
      }

      dashDirectionRef.current.copy(dashDir);
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
      setAnimState('jump');
    } else if (isKinematicGround) {
      // Firmly anchor the cat to vertical elevators whether ascending or descending
      targetVelY = groundVel.y;
    }

    // 4. Horizontal Locomotion (Relative to Camera Yaw)
    let targetVelX = 0;
    let targetVelZ = 0;

    if (isDashActive) {
      // High speed directional dash
      targetVelX = dashDirectionRef.current.x * GAME_CONFIG.player.dashSpeed;
      targetVelZ = dashDirectionRef.current.z * GAME_CONFIG.player.dashSpeed;
    } else {
      const hasInput = Math.abs(input.moveX) > 0.05 || Math.abs(input.moveZ) > 0.05;

      if (hasInput) {
        // Calculate move direction relative to camera
        const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraYaw);
        const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraYaw);

        const moveDir = forward.clone().multiplyScalar(input.moveZ).add(right.clone().multiplyScalar(input.moveX));
        moveDir.normalize();

        targetVelX = moveDir.x * GAME_CONFIG.player.maxSpeed;
        targetVelZ = moveDir.z * GAME_CONFIG.player.maxSpeed;

        // Facing direction target
        const targetAngle = Math.atan2(moveDir.x, moveDir.z);
        setFacingAngle(targetAngle);
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
    setCurrentSpeed(horizSpeed);

    // 5. Animation State Resolution
    if (!isDashActive) {
      if (!isNowGrounded) {
        if (targetVelY > 0.8) {
          setAnimState('jump');
        } else {
          setAnimState('fall');
        }
      } else if (horizSpeed > 4.5) {
        setAnimState('run');
      } else if (horizSpeed > 0.3) {
        setAnimState('walk');
      } else {
        setAnimState('idle');
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
        animState={animState}
        speed={currentSpeed}
        isDashing={isDashing}
        facingAngle={facingAngle}
        equippedAccessory={equippedAccessory}
      />
    </RigidBody>
  );
};
