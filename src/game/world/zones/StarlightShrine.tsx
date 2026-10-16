import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider, CylinderCollider } from '@react-three/rapier';
import { Collectible } from '../../objects/Collectible';
import { HiddenBell } from '../../objects/HiddenBell';
import { Checkpoint } from '../../objects/Checkpoint';
import { SaveManager } from '../../systems/SaveManager';
import { AudioManager } from '../../systems/AudioManager';
import { GameState } from '../../systems/GameState';

// Starlight Crystal Formation Prop
const StarlightCrystal: React.FC<{
  position: [number, number, number];
  scale?: [number, number, number];
  color?: string;
}> = ({ position, scale = [0.4, 1.2, 0.4], color = '#C9B8FF' }) => {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow scale={scale}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          roughness={0.15}
          metalness={0.2}
        />
      </mesh>
      <pointLight color={color} intensity={1.0} distance={3.0} />
    </group>
  );
};

// Constellation Beacon Pillar Component
const BeaconPillar: React.FC<{
  id: number;
  position: [number, number, number];
  name: string;
  isLit: boolean;
  onActivate: () => void;
}> = ({ position, name, isLit, onActivate }) => {
  const lightOrbRef = useRef<THREE.Mesh>(null);
  const beamRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (lightOrbRef.current) {
      lightOrbRef.current.rotation.y += delta * (isLit ? 3.0 : 0.8);
    }
    if (beamRef.current && isLit) {
      beamRef.current.rotation.y += delta * 1.5;
    }
  });

  const handleProximity = () => {
    if (!isLit) {
      onActivate();
    }
  };

  return (
    <group name={name} position={position}>
      {/* Sensor Collider for Cat Proximity */}
      <RigidBody type="fixed" colliders={false} sensor onIntersectionEnter={handleProximity}>
        <CylinderCollider args={[1.5, 1.6]} position={[0, 1.2, 0]} />
      </RigidBody>

      {/* Solid Base Pillar Collider */}
      <RigidBody type="fixed" colliders={false}>
        <CylinderCollider args={[1.2, 0.6]} position={[0, 1.2, 0]} />
      </RigidBody>

      {/* Stone Pedestal Base */}
      <mesh castShadow receiveShadow position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.55, 0.75, 1.2, 16]} />
        <meshStandardMaterial color="#2F2342" roughness={0.6} />
      </mesh>
      {/* Pedestal Capital */}
      <mesh castShadow receiveShadow position={[0, 1.3, 0]}>
        <cylinderGeometry args={[0.7, 0.5, 0.25, 16]} />
        <meshStandardMaterial color="#41315B" roughness={0.5} />
      </mesh>

      {/* Glowing Runes around rim */}
      <mesh position={[0, 1.31, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 0.68, 20]} />
        <meshBasicMaterial color={isLit ? '#FFDF6D' : '#6A568C'} side={THREE.DoubleSide} />
      </mesh>

      {/* Floating Constellation Crystal Orb */}
      <mesh
        ref={lightOrbRef}
        castShadow
        position={[0, 1.9, 0]}
        scale={isLit ? [0.45, 0.65, 0.45] : [0.35, 0.5, 0.35]}
      >
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color={isLit ? '#FFDF6D' : '#8D7BBA'}
          emissive={isLit ? '#FFA500' : '#49356E'}
          emissiveIntensity={isLit ? 1.0 : 0.3}
          roughness={0.15}
          metalness={0.3}
        />
      </mesh>

      {/* Celestial Light Beam shooting upward when lit */}
      {isLit && (
        <group>
          <mesh ref={beamRef} position={[0, 6.5, 0]}>
            <cylinderGeometry args={[0.18, 0.3, 9, 16, 1, true]} />
            <meshBasicMaterial
              color="#FFDF6D"
              transparent
              opacity={0.35}
              side={THREE.DoubleSide}
            />
          </mesh>
          <pointLight color="#FFE28A" intensity={3.5} distance={7} position={[0, 2.2, 0]} />
        </group>
      )}
    </group>
  );
};

export const StarlightShrine: React.FC = () => {
  const currentSave = SaveManager.getData();
  const [gateOpen, setGateOpen] = useState<boolean>(
    currentSave.shrineCompleted || currentSave.collectedStarIds.length >= 12
  );
  const [litBeacons, setLitBeacons] = useState<number[]>(
    currentSave.shrineCompleted ? [1, 2, 3] : []
  );

  const gateYRef = useRef<number>(gateOpen ? 13.5 : 17.5);
  const gateMeshRef = useRef<THREE.Group>(null);

  // Sync gate state if star fragments reach 12 while on island
  useEffect(() => {
    return SaveManager.subscribe((data) => {
      const hasEnough = data.shrineCompleted || data.collectedStarIds.length >= 12;
      if (hasEnough && !gateOpen) {
        setGateOpen(true);
        AudioManager.playGateOpen();
        GameState.showBanner('✨ 12 Star Fragments ignite! The Star Gate opens! 🌟', 3800);
        GameState.setInteractionPrompt(null);
      }
    });
  }, [gateOpen]);

  // Animate gate lower when opened
  useFrame((_, delta) => {
    if (!gateMeshRef.current) return;
    const targetY = gateOpen ? 13.5 : 17.5;
    gateYRef.current = THREE.MathUtils.lerp(gateYRef.current, targetY, Math.min(1, delta * 3.5));
    gateMeshRef.current.position.y = gateYRef.current;
  });

  const handleGateApproach = () => {
    const stars = SaveManager.getData().collectedStarIds.length;
    if (stars < 12 && !SaveManager.getData().shrineCompleted) {
      GameState.setInteractionPrompt(`Star Gate Sealed: Requires 12 Star Fragments (${stars}/12)`);
    } else if (!gateOpen) {
      setGateOpen(true);
      AudioManager.playGateOpen();
      GameState.showBanner('✨ 12 Star Fragments ignite! The Star Gate opens! 🌟', 3800);
      GameState.setInteractionPrompt(null);
    }
  };

  const handleGateExit = () => {
    GameState.setInteractionPrompt(null);
  };

  const handleActivateBeacon = (id: number, name: string) => {
    if (litBeacons.includes(id)) return;
    const nextLit = [...litBeacons, id];
    setLitBeacons(nextLit);
    AudioManager.playBeaconActivate();

    if (nextLit.length === 3) {
      // All 3 lit! Trigger Shrine Victory
      SaveManager.completeShrine();
      AudioManager.playShrineVictory();
      GameState.showBanner(
        '👑 Constellations Aligned! Starlight Shrine Restored! Crown Unlocked! [I]',
        6000
      );
    } else {
      GameState.showBanner(`${name} Beacon Awakened! (${nextLit.length}/3) 🌟`, 2500);
    }
  };

  return (
    <group>
      {/* ---------------- 1. Nocturnal Celestial Island Terrain ---------------- */}
      <RigidBody type="fixed" colliders={false}>
        {/* Main Sacred Island Plateau */}
        <CuboidCollider args={[11, 0.7, 18]} position={[70, 15.8, -68]} />
        {/* Elevated Shrine Dais */}
        <CuboidCollider args={[5.5, 0.6, 5.5]} position={[70, 16.6, -78]} />
      </RigidBody>

      {/* Main Island Ground (Deep Celestial Violet Obsidian) */}
      <mesh castShadow receiveShadow position={[70, 15.8, -68]}>
        <boxGeometry args={[22, 1.4, 36]} />
        <meshStandardMaterial color="#261A38" roughness={0.4} />
      </mesh>

      {/* Glowing Starry Ground Inlays */}
      <mesh position={[70, 16.51, -68]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.5, 3.8, 32]} />
        <meshBasicMaterial color="#7B5BA6" side={THREE.DoubleSide} />
      </mesh>

      {/* Underside Nocturnal Crystalline Spire Formations */}
      <mesh receiveShadow position={[70, 11.5, -68]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[12, 7.5, 8]} />
        <meshStandardMaterial color="#1C122B" roughness={0.8} />
      </mesh>

      {/* Elevated Dais (Shrine Constellation Altar Ground) */}
      <mesh castShadow receiveShadow position={[70, 16.6, -78]}>
        <boxGeometry args={[11.0, 1.2, 11.0]} />
        <meshStandardMaterial color="#362550" roughness={0.35} />
      </mesh>
      {/* Altar Rune Circle */}
      <mesh position={[70, 17.21, -78]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[4.2, 32]} />
        <meshStandardMaterial
          color="#FFDF6D"
          emissive="#FFA500"
          emissiveIntensity={litBeacons.length === 3 ? 0.8 : 0.2}
          roughness={0.2}
        />
      </mesh>

      {/* ---------------- 2. Star Gate (Requires 12 Star Fragments) ---------------- */}
      {/* Gate Proximity Sensor */}
      <RigidBody
        type="fixed"
        colliders={false}
        sensor
        onIntersectionEnter={handleGateApproach}
        onIntersectionExit={handleGateExit}
      >
        <CuboidCollider args={[4.0, 2.5, 2.5]} position={[70, 17.0, -56]} />
      </RigidBody>

      {/* Left Gate Column */}
      <RigidBody type="fixed" colliders={false}>
        <CylinderCollider args={[2.5, 0.45]} position={[66.5, 18.0, -56]} />
        <CylinderCollider args={[2.5, 0.45]} position={[73.5, 18.0, -56]} />
        {/* Physical solid barrier when closed */}
        {!gateOpen && <CuboidCollider args={[3.2, 2.0, 0.3]} position={[70, 17.5, -56]} />}
      </RigidBody>

      {/* Left Gate Stone Pillar */}
      <mesh castShadow receiveShadow position={[66.5, 18.0, -56]}>
        <cylinderGeometry args={[0.45, 0.55, 5.0, 16]} />
        <meshStandardMaterial color="#4A3763" roughness={0.4} />
      </mesh>
      {/* Right Gate Stone Pillar */}
      <mesh castShadow receiveShadow position={[73.5, 18.0, -56]}>
        <cylinderGeometry args={[0.45, 0.55, 5.0, 16]} />
        <meshStandardMaterial color="#4A3763" roughness={0.4} />
      </mesh>
      {/* Gate Overhead Arch */}
      <mesh castShadow receiveShadow position={[70, 20.6, -56]}>
        <boxGeometry args={[8.0, 0.7, 1.2]} />
        <meshStandardMaterial color="#3D2B52" roughness={0.4} />
      </mesh>
      {/* Golden Crest on Arch */}
      <mesh position={[70, 21.2, -56]}>
        <octahedronGeometry args={[0.45, 0]} />
        <meshStandardMaterial
          color="#FFDF6D"
          emissive="#FFA500"
          emissiveIntensity={0.6}
          roughness={0.2}
          metalness={0.7}
        />
      </mesh>

      {/* Movable Star Gate Energy Barrier */}
      <group ref={gateMeshRef} position={[70, 17.5, -56]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[6.2, 3.6, 0.15]} />
          <meshStandardMaterial
            color="#C9B8FF"
            emissive="#9D84F0"
            emissiveIntensity={0.8}
            transparent
            opacity={0.65}
            roughness={0.1}
          />
        </mesh>
        <pointLight color="#C9B8FF" intensity={2.0} distance={4.5} />
      </group>

      {/* ---------------- 3. Constellation Beacon Pillars Puzzle ---------------- */}
      {/* Beacon 1: Lyra (Alpha) */}
      <BeaconPillar
        id={1}
        name="Lyra"
        position={[65.5, 17.2, -73.5]}
        isLit={litBeacons.includes(1)}
        onActivate={() => handleActivateBeacon(1, 'Lyra')}
      />

      {/* Beacon 2: Cygnus (Beta) */}
      <BeaconPillar
        id={2}
        name="Cygnus"
        position={[74.5, 17.2, -73.5]}
        isLit={litBeacons.includes(2)}
        onActivate={() => handleActivateBeacon(2, 'Cygnus')}
      />

      {/* Beacon 3: Ursa (Gamma) */}
      <BeaconPillar
        id={3}
        name="Ursa"
        position={[70, 17.2, -83.5]}
        isLit={litBeacons.includes(3)}
        onActivate={() => handleActivateBeacon(3, 'Ursa')}
      />

      {/* Central Crown Pedestal atop Altar */}
      <mesh castShadow receiveShadow position={[70, 17.6, -78]}>
        <cylinderGeometry args={[0.5, 0.7, 0.8, 16]} />
        <meshStandardMaterial color="#4D366B" roughness={0.4} />
      </mesh>

      {/* ---------------- 4. Starlight Crystals Decor ---------------- */}
      <StarlightCrystal position={[64, 16.8, -62]} color="#C9B8FF" scale={[0.45, 1.3, 0.45]} />
      <StarlightCrystal position={[76, 16.8, -62]} color="#B9E5FF" scale={[0.4, 1.1, 0.4]} />
      <StarlightCrystal position={[63, 16.8, -78]} color="#FFDF6D" scale={[0.5, 1.4, 0.5]} />
      <StarlightCrystal position={[77, 16.8, -78]} color="#FFAEC9" scale={[0.45, 1.2, 0.45]} />

      {/* ---------------- 5. Checkpoint ---------------- */}
      <Checkpoint id="checkpoint_shrine" position={[70, 16.5, -50]} name="Starlight Sanctuary" />

      {/* ---------------- 6. Star Fragments (Zone D: 4 Stars) ---------------- */}
      {/* Star 1: On the entrance causeway before the Star Gate */}
      <Collectible id="star_shrine_1" position={[70, 17.2, -52]} />
      {/* Star 2: In the celestial crystal grove left of the path */}
      <Collectible id="star_shrine_2" position={[65, 17.6, -64]} />
      {/* Star 3: On the eastern night sky observation terrace */}
      <Collectible id="star_shrine_3" position={[75, 17.6, -64]} />
      {/* Star 4: Floating majestically high above the constellation altar */}
      <Collectible id="star_shrine_4" position={[70, 19.8, -78]} />

      {/* ---------------- 7. Hidden Bell (Zone D: 1 Bell) ---------------- */}
      {/* Bell 1: Perched atop the high Star Gate archway */}
      <HiddenBell id="bell_shrine_1" position={[70, 22.1, -56]} name="Star Gate Arch Bell" />
    </group>
  );
};
