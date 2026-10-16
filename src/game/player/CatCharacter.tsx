import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

export type CatAnimState = 'idle' | 'walk' | 'run' | 'jump' | 'fall' | 'land' | 'dash';

interface CatCharacterProps {
  animState: CatAnimState;
  speed: number; // current horizontal speed
  isDashing: boolean;
  facingAngle: number; // yaw rotation in radians
  equippedAccessory?: string | null;
}

// Materials: Glossy Vinyl Toy Aesthetic
const vinylWhite = new THREE.MeshStandardMaterial({
  color: '#FFF8FA',
  roughness: 0.18,
  metalness: 0.06,
});

const vinylPink = new THREE.MeshStandardMaterial({
  color: '#F6A9D2',
  roughness: 0.25,
  metalness: 0.05,
});

const vinylDarkPink = new THREE.MeshStandardMaterial({
  color: '#E887B7',
  roughness: 0.25,
  metalness: 0.05,
});

const vinylObsidian = new THREE.MeshStandardMaterial({
  color: '#281E2E',
  roughness: 0.1,
  metalness: 0.1,
});

const eyeSparkle = new THREE.MeshBasicMaterial({
  color: '#FFFFFF',
});

const goldBell = new THREE.MeshStandardMaterial({
  color: '#FCD34D',
  roughness: 0.2,
  metalness: 0.8,
});

export const CatCharacter: React.FC<CatCharacterProps> = ({
  animState,
  speed,
  isDashing,
  facingAngle,
  equippedAccessory = null,
}) => {
  const rootRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftEarRef = useRef<THREE.Group>(null);
  const rightEarRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Group>(null);
  const frontLeftLegRef = useRef<THREE.Group>(null);
  const frontRightLegRef = useRef<THREE.Group>(null);
  const backLeftLegRef = useRef<THREE.Group>(null);
  const backRightLegRef = useRef<THREE.Group>(null);

  // Time accumulator for animations
  const timeRef = useRef<number>(0);
  const landSquashRef = useRef<number>(1);

  useFrame((_, delta) => {
    if (!rootRef.current) return;
    timeRef.current += delta;
    const t = timeRef.current;

    // Smoothly rotate the entire cat towards target facingAngle
    const curRot = rootRef.current.rotation.y;
    // Shortest angular difference
    let diff = (facingAngle - curRot) % (Math.PI * 2);
    if (diff > Math.PI) diff -= Math.PI * 2;
    if (diff < -Math.PI) diff += Math.PI * 2;
    rootRef.current.rotation.y += diff * Math.min(1, delta * 16);

    // Default transforms
    let bodyY = 0.28;
    let bodyScaleX = 1;
    let bodyScaleY = 1;
    let bodyScaleZ = 1;
    let bodyRotX = 0;
    let headRotX = 0;
    let tailRotZ = 0;
    let tailRotY = 0;
    let earWiggle = 0;

    // Leg angles
    let flLegRotX = 0;
    let frLegRotX = 0;
    let blLegRotX = 0;
    let brLegRotX = 0;

    // Animation state machine
    if (isDashing) {
      // Dash: forward lean, stretched body, ears flat
      bodyRotX = 0.35;
      bodyScaleZ = 1.35;
      bodyScaleY = 0.75;
      bodyScaleX = 0.85;
      bodyY = 0.2;
      headRotX = -0.2;
      tailRotZ = 0.4;
      leftEarRef.current && (leftEarRef.current.rotation.z = -0.5);
      rightEarRef.current && (rightEarRef.current.rotation.z = 0.5);
    } else if (animState === 'jump') {
      // Jump: upward stretch
      bodyScaleY = 1.25;
      bodyScaleX = 0.9;
      bodyScaleZ = 0.9;
      bodyRotX = -0.2;
      headRotX = -0.25;
      tailRotZ = -0.3;
      flLegRotX = 0.4;
      frLegRotX = 0.4;
      blLegRotX = -0.5;
      brLegRotX = -0.5;
    } else if (animState === 'fall') {
      // Fall: limbs splayed out, ears up
      bodyScaleY = 0.95;
      bodyScaleX = 1.1;
      headRotX = 0.2;
      tailRotZ = 0.5;
      flLegRotX = -0.5;
      frLegRotX = -0.5;
      blLegRotX = 0.5;
      brLegRotX = 0.5;
      earWiggle = Math.sin(t * 18) * 0.15;
    } else if (animState === 'land') {
      // Land: squash-and-stretch recovery
      landSquashRef.current = Math.min(1, landSquashRef.current + delta * 5);
      const squash = 0.7 + landSquashRef.current * 0.3;
      bodyScaleY = squash;
      bodyScaleX = 1.2 / squash;
      bodyScaleZ = 1.2 / squash;
      bodyY = 0.18;
    } else if (animState === 'walk' || animState === 'run') {
      // Trot / gallop cycle
      const cycleSpeed = animState === 'run' ? Math.max(12, speed * 2.2) : Math.max(7, speed * 1.8);
      const legAmplitude = animState === 'run' ? 0.75 : 0.45;
      const cycle = Math.sin(t * cycleSpeed);
      const cycleCos = Math.cos(t * cycleSpeed);

      // Body bobbing and slight roll
      bodyY = 0.28 + Math.abs(cycle) * 0.06;
      bodyRef.current && (bodyRef.current.rotation.z = cycleCos * 0.05);

      // Opposite legs trot
      flLegRotX = cycle * legAmplitude;
      frLegRotX = -cycle * legAmplitude;
      blLegRotX = -cycle * legAmplitude;
      brLegRotX = cycle * legAmplitude;

      tailRotY = Math.sin(t * (cycleSpeed * 0.8)) * 0.4;
      headRotX = Math.abs(cycle) * 0.08;
    } else {
      // Idle: gentle breathing, tail sway, occasional ear twitch
      const breath = Math.sin(t * 2.2);
      bodyY = 0.28 + breath * 0.015;
      bodyScaleY = 1 + breath * 0.03;
      bodyScaleX = 1 - breath * 0.015;
      tailRotY = Math.sin(t * 1.8) * 0.35;
      tailRotZ = 0.15 + Math.sin(t * 3.6) * 0.08;

      // Occasional ear twitch every few seconds
      if (Math.sin(t * 0.7) > 0.9) {
        earWiggle = Math.sin(t * 25) * 0.2;
      }
    }

    // Apply to refs
    if (bodyRef.current) {
      bodyRef.current.position.y = bodyY;
      bodyRef.current.scale.set(bodyScaleX, bodyScaleY, bodyScaleZ);
      bodyRef.current.rotation.x = bodyRotX;
    }

    if (headRef.current) {
      headRef.current.rotation.x = headRotX;
    }

    if (leftEarRef.current) {
      leftEarRef.current.rotation.x = earWiggle;
    }

    if (rightEarRef.current) {
      rightEarRef.current.rotation.x = -earWiggle;
    }

    if (tailRef.current) {
      tailRef.current.rotation.y = tailRotY;
      tailRef.current.rotation.z = tailRotZ;
    }

    if (frontLeftLegRef.current) frontLeftLegRef.current.rotation.x = flLegRotX;
    if (frontRightLegRef.current) frontRightLegRef.current.rotation.x = frLegRotX;
    if (backLeftLegRef.current) backLeftLegRef.current.rotation.x = blLegRotX;
    if (backRightLegRef.current) backRightLegRef.current.rotation.x = brLegRotX;
  });

  return (
    <group ref={rootRef} dispose={null}>
      {/* Root offset to align pivot with ground */}
      <group position={[0, 0, 0]}>
        {/* Main Body */}
        <group ref={bodyRef}>
          {/* Torso: Rounded Capsule / Squashy Sphere */}
          <mesh castShadow receiveShadow material={vinylWhite} position={[0, 0, 0]}>
            <sphereGeometry args={[0.34, 24, 24]} />
          </mesh>

          {/* Cute Belly Patch */}
          <mesh material={vinylPink} position={[0, -0.05, 0.2]} rotation={[0.4, 0, 0]} scale={[0.8, 0.8, 0.4]}>
            <sphereGeometry args={[0.22, 16, 16]} />
          </mesh>

          {/* Pastel Collar */}
          <mesh material={vinylDarkPink} position={[0, 0.22, 0.08]} rotation={[0.2, 0, 0]}>
            <torusGeometry args={[0.22, 0.035, 12, 24]} />
          </mesh>

          {/* Tiny Golden Bell */}
          <mesh material={goldBell} position={[0, 0.16, 0.28]}>
            <sphereGeometry args={[0.045, 16, 16]} />
          </mesh>

          {/* Accessory: Pink Satin Ribbon Bow */}
          {equippedAccessory === 'ribbon_bow' && (
            <group position={[0, 0.17, 0.32]} rotation={[0.2, 0, 0]}>
              {/* Knot */}
              <mesh material={vinylDarkPink}>
                <sphereGeometry args={[0.035, 10, 10]} />
              </mesh>
              {/* Left Bow Loop */}
              <mesh material={vinylPink} position={[-0.065, 0.02, 0]} rotation={[0, 0.3, 0.4]} scale={[0.06, 0.038, 0.02]}>
                <sphereGeometry args={[1, 10, 10]} />
              </mesh>
              {/* Right Bow Loop */}
              <mesh material={vinylPink} position={[0.065, 0.02, 0]} rotation={[0, -0.3, -0.4]} scale={[0.06, 0.038, 0.02]}>
                <sphereGeometry args={[1, 10, 10]} />
              </mesh>
              {/* Ribbon Tails */}
              <mesh material={vinylPink} position={[-0.035, -0.055, 0.01]} rotation={[0, 0, 0.25]} scale={[0.022, 0.06, 0.01]}>
                <boxGeometry args={[1, 1, 1]} />
              </mesh>
              <mesh material={vinylPink} position={[0.035, -0.055, 0.01]} rotation={[0, 0, -0.25]} scale={[0.022, 0.06, 0.01]}>
                <boxGeometry args={[1, 1, 1]} />
              </mesh>
            </group>
          )}

          {/* Tail */}
          <group ref={tailRef} position={[0, 0.05, -0.32]}>
            {/* Segment 1 */}
            <mesh castShadow material={vinylWhite} position={[0, 0.1, -0.05]} rotation={[-0.4, 0, 0]}>
              <cylinderGeometry args={[0.05, 0.065, 0.22, 12]} />
            </mesh>
            {/* Segment 2 with Pink Tip */}
            <mesh castShadow material={vinylPink} position={[0, 0.24, -0.12]} rotation={[-0.8, 0, 0]}>
              <sphereGeometry args={[0.06, 12, 12]} />
            </mesh>
          </group>

          {/* Four Paws / Legs */}
          {/* Front Left */}
          <group ref={frontLeftLegRef} position={[-0.2, -0.15, 0.16]}>
            <mesh castShadow material={vinylWhite} position={[0, -0.06, 0]}>
              <capsuleGeometry args={[0.065, 0.12, 8, 12]} />
            </mesh>
            <mesh material={vinylDarkPink} position={[0, -0.14, 0.02]} scale={[0.8, 0.3, 0.8]}>
              <sphereGeometry args={[0.06, 8, 8]} />
            </mesh>
          </group>

          {/* Front Right */}
          <group ref={frontRightLegRef} position={[0.2, -0.15, 0.16]}>
            <mesh castShadow material={vinylWhite} position={[0, -0.06, 0]}>
              <capsuleGeometry args={[0.065, 0.12, 8, 12]} />
            </mesh>
            <mesh material={vinylDarkPink} position={[0, -0.14, 0.02]} scale={[0.8, 0.3, 0.8]}>
              <sphereGeometry args={[0.06, 8, 8]} />
            </mesh>
          </group>

          {/* Back Left */}
          <group ref={backLeftLegRef} position={[-0.2, -0.15, -0.16]}>
            <mesh castShadow material={vinylWhite} position={[0, -0.06, 0]}>
              <capsuleGeometry args={[0.07, 0.12, 8, 12]} />
            </mesh>
            <mesh material={vinylDarkPink} position={[0, -0.14, 0.02]} scale={[0.8, 0.3, 0.8]}>
              <sphereGeometry args={[0.065, 8, 8]} />
            </mesh>
          </group>

          {/* Back Right */}
          <group ref={backRightLegRef} position={[0.2, -0.15, -0.16]}>
            <mesh castShadow material={vinylWhite} position={[0, -0.06, 0]}>
              <capsuleGeometry args={[0.07, 0.12, 8, 12]} />
            </mesh>
            <mesh material={vinylDarkPink} position={[0, -0.14, 0.02]} scale={[0.8, 0.3, 0.8]}>
              <sphereGeometry args={[0.065, 8, 8]} />
            </mesh>
          </group>
        </group>

        {/* Head */}
        <group ref={headRef} position={[0, 0.58, 0.14]}>
          {/* Big Chibi Head */}
          <mesh castShadow receiveShadow material={vinylWhite}>
            <sphereGeometry args={[0.32, 28, 28]} />
          </mesh>

          {/* Cute Chubby Cheeks */}
          <mesh material={vinylWhite} position={[-0.18, -0.08, 0.14]} scale={[1, 0.8, 0.8]}>
            <sphereGeometry args={[0.13, 16, 16]} />
          </mesh>
          <mesh material={vinylWhite} position={[0.18, -0.08, 0.14]} scale={[1, 0.8, 0.8]}>
            <sphereGeometry args={[0.13, 16, 16]} />
          </mesh>

          {/* Blushies */}
          <mesh material={vinylPink} position={[-0.2, -0.05, 0.22]} scale={[1.2, 0.6, 0.4]}>
            <sphereGeometry args={[0.065, 12, 12]} />
          </mesh>
          <mesh material={vinylPink} position={[0.2, -0.05, 0.22]} scale={[1.2, 0.6, 0.4]}>
            <sphereGeometry args={[0.065, 12, 12]} />
          </mesh>

          {/* Left Ear */}
          <group ref={leftEarRef} position={[-0.2, 0.25, 0]} rotation={[0.1, 0, 0.25]}>
            <mesh castShadow material={vinylWhite} scale={[0.12, 0.2, 0.08]}>
              <coneGeometry args={[1, 1, 4]} />
            </mesh>
            {/* Inner Pink Ear */}
            <mesh material={vinylPink} position={[0, 0, 0.03]} scale={[0.08, 0.14, 0.06]}>
              <coneGeometry args={[1, 1, 4]} />
            </mesh>
          </group>

          {/* Right Ear */}
          <group ref={rightEarRef} position={[0.2, 0.25, 0]} rotation={[0.1, 0, -0.25]}>
            <mesh castShadow material={vinylWhite} scale={[0.12, 0.2, 0.08]}>
              <coneGeometry args={[1, 1, 4]} />
            </mesh>
            {/* Inner Pink Ear */}
            <mesh material={vinylPink} position={[0, 0, 0.03]} scale={[0.08, 0.14, 0.06]}>
              <coneGeometry args={[1, 1, 4]} />
            </mesh>
          </group>

          {/* Accessory: Sakura Flower Pin (worn near left ear) */}
          {equippedAccessory === 'flower_pin' && (
            <group position={[-0.22, 0.23, 0.1]} rotation={[0.2, -0.25, 0.35]}>
              {/* Golden stamen core */}
              <mesh material={goldBell}>
                <sphereGeometry args={[0.035, 10, 10]} />
              </mesh>
              {/* 5 Petals */}
              {[0, 1, 2, 3, 4].map((i) => {
                const angle = (i * Math.PI * 2) / 5;
                return (
                  <mesh
                    key={i}
                    material={vinylPink}
                    position={[Math.cos(angle) * 0.05, Math.sin(angle) * 0.05, 0]}
                    rotation={[0, 0, angle]}
                    scale={[0.045, 0.028, 0.015]}
                  >
                    <sphereGeometry args={[1, 8, 8]} />
                  </mesh>
                );
              })}
              {/* Mint leaf */}
              <mesh position={[-0.055, -0.04, -0.01]} rotation={[0, 0, -0.6]} scale={[0.035, 0.018, 0.01]}>
                <sphereGeometry args={[1, 6, 6]} />
                <meshStandardMaterial color="#BFEBD8" roughness={0.35} />
              </mesh>
            </group>
          )}

          {/* Accessory: Golden Starlight Crown (worn between ears) */}
          {equippedAccessory === 'starlight_crown' && (
            <group position={[0, 0.32, 0.02]} rotation={[-0.1, 0, 0]}>
              {/* Crown Base Circlet */}
              <mesh material={goldBell}>
                <cylinderGeometry args={[0.13, 0.14, 0.04, 16]} />
              </mesh>
              {/* Center Crown Peak */}
              <mesh material={goldBell} position={[0, 0.055, 0.11]} rotation={[-0.2, 0, 0]} scale={[0.035, 0.07, 0.02]}>
                <coneGeometry args={[1, 1, 4]} />
              </mesh>
              {/* Center Gem (Gold Star Sparkle) */}
              <mesh position={[0, 0.095, 0.1]} scale={[0.022, 0.022, 0.022]}>
                <octahedronGeometry args={[1, 0]} />
                <meshStandardMaterial
                  color="#FFDF6D"
                  emissive="#FFA500"
                  emissiveIntensity={0.8}
                  roughness={0.1}
                />
              </mesh>
              {/* Left Crown Peak */}
              <mesh material={goldBell} position={[-0.09, 0.05, 0.05]} rotation={[-0.1, 0, 0.35]} scale={[0.03, 0.06, 0.02]}>
                <coneGeometry args={[1, 1, 4]} />
              </mesh>
              {/* Left Gem (Lavender) */}
              <mesh position={[-0.11, 0.08, 0.05]} scale={[0.018, 0.018, 0.018]}>
                <octahedronGeometry args={[1, 0]} />
                <meshStandardMaterial
                  color="#C9B8FF"
                  emissive="#9D84F0"
                  emissiveIntensity={0.8}
                  roughness={0.1}
                />
              </mesh>
              {/* Right Crown Peak */}
              <mesh material={goldBell} position={[0.09, 0.05, 0.05]} rotation={[-0.1, 0, -0.35]} scale={[0.03, 0.06, 0.02]}>
                <coneGeometry args={[1, 1, 4]} />
              </mesh>
              {/* Right Gem (Cyan) */}
              <mesh position={[0.11, 0.08, 0.05]} scale={[0.018, 0.018, 0.018]}>
                <octahedronGeometry args={[1, 0]} />
                <meshStandardMaterial
                  color="#B9E5FF"
                  emissive="#6AD1FF"
                  emissiveIntensity={0.8}
                  roughness={0.1}
                />
              </mesh>
              {/* Sparkle Glow Light */}
              <pointLight color="#FFE28A" intensity={1.2} distance={1.8} position={[0, 0.1, 0.08]} />
            </group>
          )}

          {/* Left Eye */}
          <group position={[-0.12, 0.02, 0.27]} rotation={[0, -0.2, 0]}>
            <mesh material={vinylObsidian} scale={[1, 1.25, 0.5]}>
              <sphereGeometry args={[0.05, 16, 16]} />
            </mesh>
            {/* Catchlight spark */}
            <mesh material={eyeSparkle} position={[-0.015, 0.025, 0.035]} scale={[1, 1, 0.3]}>
              <sphereGeometry args={[0.016, 8, 8]} />
            </mesh>
            <mesh material={eyeSparkle} position={[0.015, -0.015, 0.035]} scale={[1, 1, 0.3]}>
              <sphereGeometry args={[0.008, 8, 8]} />
            </mesh>
          </group>

          {/* Right Eye */}
          <group position={[0.12, 0.02, 0.27]} rotation={[0, 0.2, 0]}>
            <mesh material={vinylObsidian} scale={[1, 1.25, 0.5]}>
              <sphereGeometry args={[0.05, 16, 16]} />
            </mesh>
            {/* Catchlight spark */}
            <mesh material={eyeSparkle} position={[-0.015, 0.025, 0.035]} scale={[1, 1, 0.3]}>
              <sphereGeometry args={[0.016, 8, 8]} />
            </mesh>
            <mesh material={eyeSparkle} position={[0.015, -0.015, 0.035]} scale={[1, 1, 0.3]}>
              <sphereGeometry args={[0.008, 8, 8]} />
            </mesh>
          </group>

          {/* Petite Pink Nose */}
          <mesh material={vinylDarkPink} position={[0, -0.04, 0.31]} scale={[1.2, 0.8, 0.5]}>
            <sphereGeometry args={[0.025, 12, 12]} />
          </mesh>
        </group>
      </group>
    </group>
  );
};
