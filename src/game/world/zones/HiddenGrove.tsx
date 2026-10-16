import React from 'react';
import { RigidBody, CuboidCollider, CylinderCollider } from '@react-three/rapier';
import { Collectible } from '../../objects/Collectible';
import { HiddenBell } from '../../objects/HiddenBell';
import { Checkpoint } from '../../objects/Checkpoint';
import { GameState } from '../../systems/GameState';

// Bioluminescent Glowing Mushroom Prop
const GlowingMushroom: React.FC<{
  position: [number, number, number];
  color?: string;
  size?: number;
}> = ({ position, color = '#7DF9FF', size = 1.0 }) => {
  return (
    <group position={position} scale={[size, size, size]}>
      {/* Stem */}
      <mesh castShadow receiveShadow position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.08, 0.14, 0.6, 10]} />
        <meshStandardMaterial color="#E0F7FA" roughness={0.4} />
      </mesh>
      {/* Glowing Cap */}
      <mesh castShadow position={[0, 0.6, 0]}>
        <sphereGeometry args={[0.35, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.7}
          roughness={0.2}
        />
      </mesh>
      <pointLight color={color} intensity={1.2} distance={2.8} position={[0, 0.65, 0]} />
    </group>
  );
};

// Ancient Cat Guardian Easter Egg Statue
const AncientCatStatue: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const handleInspect = () => {
    GameState.setInteractionPrompt(
      '[E] Ancient Guardian Inscription: "Dedicated to curious cats who seek the edge of the world 🐾"'
    );
  };

  const handleExit = () => {
    GameState.setInteractionPrompt(null);
  };

  return (
    <group position={position}>
      {/* Interaction Sensor Trigger */}
      <RigidBody
        type="fixed"
        colliders={false}
        sensor
        onIntersectionEnter={handleInspect}
        onIntersectionExit={handleExit}
      >
        <CylinderCollider args={[1.6, 2.2]} position={[0, 1.2, 0]} />
      </RigidBody>

      {/* Solid Base Collider */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[1.2, 1.5, 1.2]} position={[0, 1.5, 0]} />
      </RigidBody>

      {/* Stone Pedestal Base */}
      <mesh castShadow receiveShadow position={[0, 0.4, 0]}>
        <boxGeometry args={[2.0, 0.8, 2.0]} />
        <meshStandardMaterial color="#50665B" roughness={0.7} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.9, 0]}>
        <boxGeometry args={[1.6, 0.3, 1.6]} />
        <meshStandardMaterial color="#6A8074" roughness={0.6} />
      </mesh>

      {/* Golden Stylized Maneki-neko Cat Figure */}
      <group position={[0, 1.05, 0]}>
        {/* Body */}
        <mesh castShadow position={[0, 0.5, 0]}>
          <capsuleGeometry args={[0.42, 0.5, 12, 16]} />
          <meshStandardMaterial color="#E5C158" roughness={0.3} metalness={0.75} />
        </mesh>
        {/* Head */}
        <mesh castShadow position={[0, 1.15, 0]}>
          <sphereGeometry args={[0.38, 16, 16]} />
          <meshStandardMaterial color="#E5C158" roughness={0.3} metalness={0.75} />
        </mesh>
        {/* Left Ear */}
        <mesh castShadow position={[-0.22, 1.48, 0]} rotation={[0, 0, 0.3]}>
          <coneGeometry args={[0.12, 0.25, 4]} />
          <meshStandardMaterial color="#E5C158" roughness={0.3} metalness={0.75} />
        </mesh>
        {/* Right Ear */}
        <mesh castShadow position={[0.22, 1.48, 0]} rotation={[0, 0, -0.3]}>
          <coneGeometry args={[0.12, 0.25, 4]} />
          <meshStandardMaterial color="#E5C158" roughness={0.3} metalness={0.75} />
        </mesh>
        {/* Raised Lucky Left Paw (Platform holding secret star!) */}
        <group position={[-0.38, 0.95, 0.2]} rotation={[0.4, 0, 0.5]}>
          <mesh castShadow>
            <capsuleGeometry args={[0.12, 0.35, 8, 12]} />
            <meshStandardMaterial color="#FCD34D" roughness={0.25} metalness={0.8} />
          </mesh>
          <mesh position={[0, 0.22, 0]}>
            <sphereGeometry args={[0.14, 12, 12]} />
            <meshStandardMaterial color="#FCD34D" roughness={0.2} metalness={0.85} />
          </mesh>
        </group>
        {/* Golden Koban Coin on Chest */}
        <mesh position={[0, 0.45, 0.42]} rotation={[0.2, 0, 0]} scale={[0.18, 0.28, 0.04]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color="#FFDF6D"
            emissive="#FFA500"
            emissiveIntensity={0.5}
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>
      </group>
    </group>
  );
};

// Mystical Stepping Rock Platform
const SecretRockStep: React.FC<{
  position: [number, number, number];
  size?: [number, number, number];
  color?: string;
}> = ({ position, size = [2.4, 0.5, 2.4], color = '#6B8E7B' }) => {
  return (
    <group position={position}>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[size[0] / 2, size[1] / 2, size[2] / 2]} />
      </RigidBody>
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {/* Underside stone peak */}
      <mesh position={[0, -size[1] / 2 - 0.2, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[size[0] * 0.5, 0.6, 6]} />
        <meshStandardMaterial color="#4A6153" roughness={0.7} />
      </mesh>
    </group>
  );
};

export const HiddenGrove: React.FC = () => {
  return (
    <group>
      {/* ---------------- 1. Hidden Grotto Island Terrain ---------------- */}
      <RigidBody type="fixed" colliders={false}>
        {/* Main Grotto Plateau */}
        <CuboidCollider args={[8, 0.6, 8]} position={[-28, -0.4, -26]} />
        {/* High Secluded Lookout Ledge */}
        <CuboidCollider args={[3.2, 0.8, 3.2]} position={[-32, 0.8, -32]} />
      </RigidBody>

      {/* Main Grotto Island Top (Mystical Emerald Turquoise Moss) */}
      <mesh castShadow receiveShadow position={[-28, -0.4, -26]}>
        <boxGeometry args={[16, 1.2, 16]} />
        <meshStandardMaterial color="#6BB89D" roughness={0.45} />
      </mesh>

      {/* Underside Inverted Stone Cave Pyramid */}
      <mesh receiveShadow position={[-28, -3.8, -26]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[9, 5.5, 7]} />
        <meshStandardMaterial color="#475C51" roughness={0.8} />
      </mesh>

      {/* Secluded Lookout Ledge */}
      <mesh castShadow receiveShadow position={[-32, 0.8, -32]}>
        <boxGeometry args={[6.4, 1.6, 6.4]} />
        <meshStandardMaterial color="#5CA98E" roughness={0.4} />
      </mesh>

      {/* ---------------- 2. Ancient Cat Guardian Statue Easter Egg ---------------- */}
      <AncientCatStatue position={[-30, 1.6, -32]} />

      {/* ---------------- 3. Bioluminescent Glowing Mushrooms ---------------- */}
      <GlowingMushroom position={[-24, 0.2, -22]} color="#7DF9FF" size={1.2} />
      <GlowingMushroom position={[-25, 0.2, -21]} color="#C9B8FF" size={0.9} />
      <GlowingMushroom position={[-32, 0.2, -24]} color="#7DF9FF" size={1.4} />
      <GlowingMushroom position={[-33.5, 0.2, -25.5]} color="#FFAEC9" size={1.0} />
      <GlowingMushroom position={[-26, 0.2, -30]} color="#B9E5FF" size={1.1} />

      {/* ---------------- 4. Secret Scenic Skyway Bridge toward Starlight Shrine ---------------- */}
      {/* Alternate secret stepping-stone route connecting Hidden Grove to Starlight Shrine */}
      <SecretRockStep position={[-20, 1.2, -34]} color="#7B9E8B" />
      <SecretRockStep position={[-16, 2.0, -36.5]} color="#82A692" />
      <SecretRockStep position={[-12, 2.8, -39]} color="#89AD99" />
      <SecretRockStep position={[-8, 3.7, -42]} color="#8FB5A0" />
      <SecretRockStep position={[-4, 4.6, -45]} color="#96BCA7" />
      <SecretRockStep position={[0, 5.5, -48.5]} color="#9DC3AE" />
      <SecretRockStep position={[4, 6.4, -52]} color="#A3CBB5" />
      <SecretRockStep position={[8, 7.3, -55.5]} color="#B0D3BF" />
      <SecretRockStep position={[12, 8.2, -59]} color="#BFD8C7" />
      <SecretRockStep position={[16, 9.1, -62]} color="#C9B8FF" />
      <SecretRockStep position={[20, 10.0, -64.5]} color="#D0C2FF" />
      <SecretRockStep position={[24, 10.9, -66.5]} color="#D9CEFF" />
      <SecretRockStep position={[28, 11.8, -68.5]} color="#E4DBFF" />
      <SecretRockStep position={[33, 12.7, -70]} color="#FFD1E3" />
      <SecretRockStep position={[38, 13.6, -71]} color="#FFDF6D" />
      <SecretRockStep position={[43, 14.4, -72]} color="#FFE58F" />
      <SecretRockStep position={[48, 15.1, -72.5]} color="#B9E5FF" />
      <SecretRockStep position={[53, 15.8, -73]} color="#C9B8FF" />

      {/* ---------------- 5. Checkpoint ---------------- */}
      <Checkpoint id="checkpoint_hidden" position={[-26, 0.3, -22]} name="Hidden Grove Grotto" />

      {/* ---------------- 6. Star Fragments (Zone Optional: 2 Stars) ---------------- */}
      {/* Star 1: Hidden among the sacred glowing mushrooms */}
      <Collectible id="star_hidden_1" position={[-26, 1.2, -26]} />
      {/* Star 2: Perched directly atop the Ancient Guardian Cat's lucky paw! */}
      <Collectible id="star_hidden_2" position={[-30.4, 3.4, -31.8]} />

      {/* ---------------- 7. Hidden Bells (Zone Optional: 2 Bells) ---------------- */}
      {/* Bell 1: Nestled deep within the glowing mushroom cluster */}
      <HiddenBell id="bell_hidden_1" position={[-33, 1.2, -24.5]} name="Bioluminescent Grotto Bell" />
      {/* Bell 2: Floating over the secret stargazing cliff edge overlooking the abyss */}
      <HiddenBell id="bell_hidden_2" position={[-23.5, 2.0, -32]} name="Abyss Lookout Bell" />
    </group>
  );
};
