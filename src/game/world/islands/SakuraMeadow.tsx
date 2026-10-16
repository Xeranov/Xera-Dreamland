import React from 'react';
import { RigidBody, CuboidCollider, CylinderCollider } from '@react-three/rapier';
import { Collectible } from '../../objects/Collectible';
import { HiddenBell } from '../../objects/HiddenBell';
import { BounceMushroom } from '../../objects/BounceMushroom';
import { PushableBox } from '../../objects/PushableBox';
import { Checkpoint } from '../../objects/Checkpoint';
import { GameState } from '../../systems/GameState';

// Stylized Sakura Tree Component
const SakuraTree: React.FC<{ position: [number, number, number]; scale?: number }> = ({
  position,
  scale = 1.0,
}) => {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Trunk Collider */}
      <RigidBody type="fixed" colliders={false}>
        <CylinderCollider args={[1.5, 0.35]} position={[0, 1.5, 0]} />
      </RigidBody>

      {/* Trunk Mesh */}
      <mesh castShadow receiveShadow position={[0, 1.4, 0]}>
        <cylinderGeometry args={[0.28, 0.45, 2.8, 10]} />
        <meshStandardMaterial color="#7D5C4E" roughness={0.7} />
      </mesh>

      {/* Foliage Clusters (Fluffy pink low-poly clouds) */}
      <mesh castShadow receiveShadow position={[0, 3.2, 0]}>
        <sphereGeometry args={[1.4, 14, 14]} />
        <meshStandardMaterial color="#F6A9D2" roughness={0.35} />
      </mesh>
      <mesh castShadow receiveShadow position={[-0.8, 2.7, 0.4]}>
        <sphereGeometry args={[1.0, 12, 12]} />
        <meshStandardMaterial color="#FFAEC9" roughness={0.35} />
      </mesh>
      <mesh castShadow receiveShadow position={[0.7, 2.9, -0.5]}>
        <sphereGeometry args={[1.1, 12, 12]} />
        <meshStandardMaterial color="#E887B7" roughness={0.35} />
      </mesh>
      <mesh castShadow receiveShadow position={[0.2, 3.9, 0.3]}>
        <sphereGeometry args={[0.9, 12, 12]} />
        <meshStandardMaterial color="#FFF0F5" roughness={0.3} />
      </mesh>
    </group>
  );
};

// Pastel Cottage Component
const PastelCottage: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  return (
    <group position={position}>
      {/* Cottage Walls Solid Collider */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[2.0, 1.4, 1.8]} position={[0, 1.4, 0]} />
        <CuboidCollider args={[2.2, 0.6, 2.0]} position={[0, 3.2, 0]} />
      </RigidBody>

      {/* Main Cottage Walls */}
      <mesh castShadow receiveShadow position={[0, 1.4, 0]}>
        <boxGeometry args={[4.0, 2.8, 3.6]} />
        <meshStandardMaterial color="#FFF7FA" roughness={0.3} />
      </mesh>

      {/* Slanted Pastel Roof */}
      <mesh castShadow receiveShadow position={[0, 3.4, 0]} rotation={[0, 0, 0]}>
        <coneGeometry args={[3.2, 1.8, 4]} />
        <meshStandardMaterial color="#F6A9D2" roughness={0.25} />
      </mesh>

      {/* Cute Chimney */}
      <mesh castShadow position={[1.0, 3.8, -0.6]}>
        <boxGeometry args={[0.5, 1.2, 0.5]} />
        <meshStandardMaterial color="#D4A5B8" roughness={0.5} />
      </mesh>

      {/* Wooden Door */}
      <mesh position={[0, 0.9, 1.82]}>
        <boxGeometry args={[0.9, 1.8, 0.08]} />
        <meshStandardMaterial color="#B08974" roughness={0.5} />
      </mesh>
      {/* Door Knob */}
      <mesh position={[0.3, 0.9, 1.88]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#FCD34D" metalness={0.7} roughness={0.2} />
      </mesh>

      {/* Round Window */}
      <mesh position={[-1.2, 1.6, 1.82]}>
        <circleGeometry args={[0.42, 16]} />
        <meshStandardMaterial color="#B9E5FF" roughness={0.1} />
      </mesh>
      <mesh position={[1.2, 1.6, 1.82]}>
        <circleGeometry args={[0.42, 16]} />
        <meshStandardMaterial color="#B9E5FF" roughness={0.1} />
      </mesh>
    </group>
  );
};

// Tutorial Signboard Component with proximity sensor
const Signboard: React.FC<{
  position: [number, number, number];
  text: string;
  label: string;
}> = ({ position, text, label }) => {
  const handleEnter = () => {
    GameState.setInteractionPrompt(`[E] Read ${label}: "${text}"`);
  };

  const handleExit = () => {
    GameState.setInteractionPrompt(null);
  };

  return (
    <group position={position}>
      {/* Sensor Trigger */}
      <RigidBody
        type="fixed"
        colliders={false}
        sensor
        onIntersectionEnter={handleEnter}
        onIntersectionExit={handleExit}
      >
        <CylinderCollider args={[1.5, 1.8]} position={[0, 0.8, 0]} />
      </RigidBody>

      {/* Post */}
      <mesh castShadow position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 1.1, 8]} />
        <meshStandardMaterial color="#8D6F64" roughness={0.6} />
      </mesh>

      {/* Board */}
      <mesh castShadow position={[0, 0.95, 0.05]} rotation={[-0.1, 0, 0]}>
        <boxGeometry args={[0.9, 0.55, 0.08]} />
        <meshStandardMaterial color="#FFF5EA" roughness={0.4} />
      </mesh>

      {/* Border Rim */}
      <mesh position={[0, 0.95, 0.06]} rotation={[-0.1, 0, 0]}>
        <boxGeometry args={[0.96, 0.61, 0.05]} />
        <meshStandardMaterial color="#D4A76A" roughness={0.5} />
      </mesh>
    </group>
  );
};

// Stepping Stone Platform
const SteppingPlatform: React.FC<{
  position: [number, number, number];
  size?: [number, number, number];
  color?: string;
}> = ({ position, size = [2.2, 0.6, 2.2], color = '#BFEBD8' }) => {
  return (
    <group position={position}>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[size[0] / 2, size[1] / 2, size[2] / 2]} />
      </RigidBody>
      {/* Grassy Top */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} roughness={0.35} />
      </mesh>
      {/* Soil Bottom */}
      <mesh castShadow receiveShadow position={[0, -size[1] / 2 - 0.25, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[size[0] * 0.55, 0.6, 6]} />
        <meshStandardMaterial color="#8D6F64" roughness={0.7} />
      </mesh>
    </group>
  );
};

export const SakuraMeadow: React.FC = () => {
  return (
    <group>
      {/* ---------------- 1. Main Floating Island ---------------- */}
      <RigidBody type="fixed" colliders={false}>
        {/* Main Meadow Plateau Collider */}
        <CuboidCollider args={[10, 0.5, 10]} position={[0, 0, 0]} />
        {/* Small Sloped Mound Collider */}
        <CuboidCollider args={[3.5, 0.6, 3.5]} position={[5, 0.6, -4]} />
        {/* Elevated Overlook Ridge Collider */}
        <CuboidCollider args={[3.0, 1.2, 3.0]} position={[-6, 1.2, -5]} />
      </RigidBody>

      {/* Main Meadow Visual Top Ground */}
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[20, 1.0, 20]} />
        <meshStandardMaterial color="#BFEBD8" roughness={0.35} />
      </mesh>

      {/* Island Cliff Underside (Inverted Stylized Rock Pyramids) */}
      <mesh receiveShadow position={[0, -2.6, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[11, 4.2, 7]} />
        <meshStandardMaterial color="#94776C" roughness={0.8} />
      </mesh>
      <mesh receiveShadow position={[-3, -3.2, 2]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[6, 3.8, 6]} />
        <meshStandardMaterial color="#7A6158" roughness={0.8} />
      </mesh>

      {/* Elevated Rolling Hills (Visuals) */}
      <mesh castShadow receiveShadow position={[5, 0.6, -4]}>
        <boxGeometry args={[7.0, 1.2, 7.0]} />
        <meshStandardMaterial color="#B2E6CF" roughness={0.35} />
      </mesh>
      <mesh castShadow receiveShadow position={[-6, 1.2, -5]}>
        <boxGeometry args={[6.0, 2.4, 6.0]} />
        <meshStandardMaterial color="#A8E0C7" roughness={0.35} />
      </mesh>

      {/* ---------------- 2. Stepping Stone Floating Platforms ---------------- */}
      <SteppingPlatform position={[13, 0.8, -2]} size={[2.6, 0.5, 2.6]} />
      <SteppingPlatform position={[16, 1.6, -5]} size={[2.4, 0.5, 2.4]} />
      <SteppingPlatform position={[14, 2.4, -9]} size={[3.5, 0.6, 3.5]} color="#C9B8FF" />

      {/* High Challenge Platform over the Void */}
      <SteppingPlatform position={[18, 3.6, -13]} size={[2.2, 0.5, 2.2]} color="#FFDF6D" />

      {/* Archipelago Bridges: Pathway to Candy Garden (East) */}
      <SteppingPlatform position={[16, 0.9, 6]} size={[2.8, 0.5, 2.8]} color="#FFCAD4" />
      <SteppingPlatform position={[22, 1.2, 9]} size={[3.0, 0.5, 3.0]} color="#BFEBD8" />
      <SteppingPlatform position={[28, 1.5, 12]} size={[3.2, 0.6, 3.2]} color="#FFCAD4" />

      {/* Archipelago Bridges: Secret Path to Hidden Grove (North-West) */}
      <SteppingPlatform position={[-11, 0.8, -8]} size={[2.2, 0.4, 2.2]} color="#A8E0C7" />
      <SteppingPlatform position={[-15, 0.4, -13]} size={[2.4, 0.4, 2.4]} color="#98D6BC" />
      <SteppingPlatform position={[-19, 0.1, -18]} size={[2.5, 0.4, 2.5]} color="#88CBB1" />

      {/* ---------------- 3. Sakura Trees ---------------- */}
      <SakuraTree position={[-4, 0.5, 4]} scale={1.2} />
      <SakuraTree position={[6, 0.5, 5]} scale={1.0} />
      <SakuraTree position={[-7, 2.4, -6]} scale={1.3} />
      <SakuraTree position={[6.5, 1.2, -5.5]} scale={1.1} />
      <SakuraTree position={[2, 0.5, -7]} scale={0.9} />

      {/* ---------------- 4. Architecture & Props ---------------- */}
      <PastelCottage position={[-6, 0.5, 4.5]} />

      {/* Bounce Mushroom (placed in front of cottage to launch cat onto roof) */}
      <BounceMushroom position={[-4.5, 0.5, 7.2]} bounceForce={16.2} />
      {/* Secondary Mushroom for shortcut to hill */}
      <BounceMushroom position={[2.5, 0.5, -2.5]} bounceForce={13.5} />

      {/* Pushable Physics Toys */}
      <PushableBox position={[3, 1.2, 3]} size={[0.85, 0.85, 0.85]} color="#FFCAD4" shape="box" />
      <PushableBox position={[4.2, 1.2, 2.2]} size={[0.75, 0.75, 0.75]} color="#C9B8FF" shape="box" />
      <PushableBox position={[3.6, 1.2, 0.8]} size={[0.8, 0.8, 0.8]} color="#B9E5FF" shape="ball" />

      {/* ---------------- 5. Tutorial Signboards ---------------- */}
      <Signboard
        position={[0, 0.5, 1.8]}
        label="Controls Guide"
        text="Move with [WASD] or Joystick. Jump with [Space]. Meow with [M]!"
      />
      <Signboard
        position={[10.5, 0.5, -1.2]}
        label="Dash Tip"
        text="Press [Shift] or Dash button to leap across floating gaps!"
      />
      <Signboard
        position={[-3.2, 0.5, 6.5]}
        label="Bounce Mushroom"
        text="Jump on the pink bouncy mushroom to reach the cottage roof!"
      />

      {/* ---------------- 6. Checkpoints ---------------- */}
      <Checkpoint id="sakura_start" position={[0, 0.5, 0]} name="Sakura Meadow Spawn" />
      <Checkpoint id="sakura_cliffs" position={[14, 2.7, -9]} name="Starlight Overlook" />

      {/* ---------------- 7. Star Fragments (6 Collectibles in Zone A) ---------------- */}
      {/* Star 1: Welcome fragment near spawn grove */}
      <Collectible id="star_meadow_1" position={[1.5, 1.4, 3.5]} />
      {/* Star 2: On top of the grassy rolling mound */}
      <Collectible id="star_meadow_2" position={[5.5, 2.2, -4]} />
      {/* Star 3: Across the first stepping stone */}
      <Collectible id="star_meadow_3" position={[13, 2.0, -2]} />
      {/* Star 4: High challenge platform over void */}
      <Collectible id="star_meadow_4" position={[18, 4.8, -13]} />
      {/* Star 5: On the cottage roof (requires mushroom bounce!) */}
      <Collectible id="star_meadow_5" position={[-6, 4.8, 4.5]} />
      {/* Star 6: Behind the ancient overlook tree */}
      <Collectible id="star_meadow_6" position={[-8.2, 3.2, -6.5]} />

      {/* ---------------- 8. Hidden Bells (Zone A: 1 Bell) ---------------- */}
      {/* Bell 1: Tucked high on the cottage chimney */}
      <HiddenBell id="bell_meadow_1" position={[-5.0, 5.2, 3.9]} name="Cottage Chimney Bell" />
    </group>
  );
};
