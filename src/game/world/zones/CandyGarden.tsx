import React from 'react';
import { RigidBody, CuboidCollider, CylinderCollider } from '@react-three/rapier';
import { Collectible } from '../../objects/Collectible';
import { HiddenBell } from '../../objects/HiddenBell';
import { BounceMushroom } from '../../objects/BounceMushroom';
import { PushableBox } from '../../objects/PushableBox';
import { Checkpoint } from '../../objects/Checkpoint';

// Giant Swirled Lollipop Prop
const GiantLollipop: React.FC<{
  position: [number, number, number];
  colorA?: string;
  colorB?: string;
  height?: number;
}> = ({ position, colorA = '#FFB6C1', colorB = '#FFF0F5', height = 5 }) => {
  return (
    <group position={position}>
      {/* Stick Collider */}
      <RigidBody type="fixed" colliders={false}>
        <CylinderCollider args={[height / 2, 0.22]} position={[0, height / 2, 0]} />
      </RigidBody>
      {/* White Stick */}
      <mesh castShadow receiveShadow position={[0, height / 2, 0]}>
        <cylinderGeometry args={[0.18, 0.22, height, 12]} />
        <meshStandardMaterial color="#FFF9FA" roughness={0.3} />
      </mesh>
      {/* Spiral Candy Disc */}
      <mesh castShadow receiveShadow position={[0, height + 1.2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[1.5, 1.5, 0.45, 24]} />
        <meshStandardMaterial color={colorA} roughness={0.25} />
      </mesh>
      {/* Swirl Pattern Layer */}
      <mesh position={[0, height + 1.2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[1.25, 1.25, 0.48, 24]} />
        <meshStandardMaterial color={colorB} roughness={0.25} />
      </mesh>
      <mesh position={[0, height + 1.2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.7, 0.7, 0.51, 24]} />
        <meshStandardMaterial color={colorA} roughness={0.25} />
      </mesh>
    </group>
  );
};

// Peppermint Candy Cane Arch
const CandyCaneArch: React.FC<{ position: [number, number, number]; rotationY?: number }> = ({
  position,
  rotationY = 0,
}) => {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Left Pillar */}
      <mesh castShadow receiveShadow position={[-1.2, 1.8, 0]}>
        <cylinderGeometry args={[0.22, 0.25, 3.6, 12]} />
        <meshStandardMaterial color="#FF6584" roughness={0.3} />
      </mesh>
      {/* Right Pillar */}
      <mesh castShadow receiveShadow position={[1.2, 1.8, 0]}>
        <cylinderGeometry args={[0.22, 0.25, 3.6, 12]} />
        <meshStandardMaterial color="#FF6584" roughness={0.3} />
      </mesh>
      {/* Crossbar Arch */}
      <mesh castShadow receiveShadow position={[0, 3.6, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.22, 0.22, 2.6, 12]} />
        <meshStandardMaterial color="#FFF7FA" roughness={0.3} />
      </mesh>
      {/* Striped Ring Accents */}
      {[-0.8, -0.4, 0, 0.4, 0.8].map((x, i) => (
        <mesh key={i} position={[x, 3.6, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.24, 0.24, 0.15, 12]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#FF6584' : '#FFF7FA'} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
};

// Pastel Gumdrop Stepping Stone
const GumdropStep: React.FC<{
  position: [number, number, number];
  color?: string;
  size?: number;
}> = ({ position, color = '#FFCAD4', size = 1.2 }) => {
  return (
    <group position={position}>
      <RigidBody type="fixed" colliders={false}>
        <CylinderCollider args={[0.35 * size, 0.8 * size]} position={[0, 0.35 * size, 0]} />
      </RigidBody>
      <mesh castShadow receiveShadow position={[0, 0.4 * size, 0]}>
        <cylinderGeometry args={[0.65 * size, 0.85 * size, 0.8 * size, 16]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.05} />
      </mesh>
      <mesh castShadow position={[0, 0.8 * size, 0]}>
        <sphereGeometry args={[0.65 * size, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.05} />
      </mesh>
    </group>
  );
};

export const CandyGarden: React.FC = () => {
  return (
    <group>
      {/* ---------------- 1. Main Candy Island Terrain ---------------- */}
      <RigidBody type="fixed" colliders={false}>
        {/* Main Sugar Plateau Collider */}
        <CuboidCollider args={[12, 0.6, 12]} position={[46, 1.8, 22]} />
        {/* Upper Strawberry Hill Mound Collider */}
        <CuboidCollider args={[4.5, 0.8, 4.5]} position={[52, 2.8, 26]} />
      </RigidBody>

      {/* Main Candy Top Ground (Pastel Mint Frosting) */}
      <mesh castShadow receiveShadow position={[46, 1.8, 22]}>
        <boxGeometry args={[24, 1.2, 24]} />
        <meshStandardMaterial color="#BCECE0" roughness={0.35} />
      </mesh>

      {/* Biscuit Wafer Layer (Middle Rim) */}
      <mesh receiveShadow position={[46, 0.8, 22]}>
        <boxGeometry args={[24.4, 0.8, 24.4]} />
        <meshStandardMaterial color="#F3D5B5" roughness={0.6} />
      </mesh>

      {/* Underside Inverted Sugar Rock Cone */}
      <mesh receiveShadow position={[46, -2.4, 22]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[13, 5.0, 7]} />
        <meshStandardMaterial color="#E7BC91" roughness={0.7} />
      </mesh>

      {/* Upper Strawberry Hill (Pastel Pink Frosting) */}
      <mesh castShadow receiveShadow position={[52, 2.8, 26]}>
        <boxGeometry args={[9.0, 1.6, 9.0]} />
        <meshStandardMaterial color="#FFCCD5" roughness={0.3} />
      </mesh>

      {/* ---------------- 2. Giant Bouncy Jelly Mushrooms ---------------- */}
      {/* Jelly Mushroom 1: Standard bounce to climb the mound */}
      <BounceMushroom position={[44, 2.4, 20]} bounceForce={15.5} />

      {/* Jelly Mushroom 2: High bounce launching cat to Giant Lollipop top! */}
      <BounceMushroom position={[53, 3.6, 22]} bounceForce={19.0} />

      {/* Jelly Mushroom 3: Super mega bounce launching cat high over void for secret star! */}
      <BounceMushroom position={[48, 2.4, 31]} bounceForce={22.5} />

      {/* ---------------- 3. Pushable Candy Blocks & Beach Balls ---------------- */}
      <PushableBox position={[41, 3.0, 24]} size={[0.9, 0.9, 0.9]} color="#FFCAD4" shape="box" />
      <PushableBox position={[42.5, 3.0, 25.5]} size={[0.85, 0.85, 0.85]} color="#C9B8FF" shape="box" />
      <PushableBox position={[47, 3.0, 18]} size={[0.95, 0.95, 0.95]} color="#FFD166" shape="ball" />
      <PushableBox position={[49, 3.0, 19.5]} size={[0.85, 0.85, 0.85]} color="#B9E5FF" shape="ball" />

      {/* ---------------- 4. Candy Cane Arches & Giant Lollipops ---------------- */}
      <CandyCaneArch position={[38, 2.4, 18]} rotationY={0.3} />
      <CandyCaneArch position={[46, 2.4, 22]} rotationY={-0.4} />

      {/* Giant Lollipop 1 (with high platform star atop!) */}
      <GiantLollipop position={[55, 3.6, 23]} height={4.2} colorA="#FF6584" colorB="#FFF0F5" />
      {/* Giant Lollipop 2 */}
      <GiantLollipop position={[40, 2.4, 30]} height={3.5} colorA="#C9B8FF" colorB="#EAE4F7" />
      {/* Giant Lollipop 3 */}
      <GiantLollipop position={[57, 2.4, 16]} height={3.0} colorA="#FFD166" colorB="#FFF7E6" />

      {/* ---------------- 5. Gumdrop Stepping Stones ---------------- */}
      <GumdropStep position={[57, 2.2, 17]} color="#FFCAD4" size={1.3} />
      <GumdropStep position={[60, 2.8, 19]} color="#C9B8FF" size={1.2} />
      <GumdropStep position={[63, 3.6, 21]} color="#BFEBD8" size={1.4} />

      {/* Connecting Bridge to Zone C (Cloud Bridges) */}
      <GumdropStep position={[64, 4.4, 16]} color="#FFF4F8" size={1.5} />
      <GumdropStep position={[66, 5.2, 11]} color="#FFF4F8" size={1.5} />

      {/* Hidden Ledge below south cliff */}
      <GumdropStep position={[52, 0.8, 35]} color="#FFCCD5" size={1.6} />

      {/* ---------------- 6. Checkpoint ---------------- */}
      <Checkpoint id="checkpoint_candy" position={[38, 2.4, 16]} name="Candy Garden Haven" />

      {/* ---------------- 7. Star Fragments (Zone B: 6 Stars) ---------------- */}
      {/* Star 1: Welcome entrance star */}
      <Collectible id="star_candy_1" position={[38, 3.5, 18]} />
      {/* Star 2: Atop Giant Lollipop (jump from 19.0 bounce mushroom!) */}
      <Collectible id="star_candy_2" position={[55, 8.8, 23]} />
      {/* Star 3: Underneath the center candy arch */}
      <Collectible id="star_candy_3" position={[46, 3.4, 22]} />
      {/* Star 4: Atop the highest gumdrop step */}
      <Collectible id="star_candy_4" position={[63, 5.2, 21]} />
      {/* Star 5: High sky star (reachable via 22.5 force mega bounce mushroom!) */}
      <Collectible id="star_candy_5" position={[48, 9.8, 31]} />
      {/* Star 6: Strawberry hill overlook star */}
      <Collectible id="star_candy_6" position={[54, 4.8, 29]} />

      {/* ---------------- 8. Hidden Bells (Zone B: 2 Bells) ---------------- */}
      {/* Bell 1: Tucked behind the sweet candy cane stack */}
      <HiddenBell id="bell_candy_1" position={[39.5, 3.2, 30.5]} name="Peppermint Alcove Bell" />
      {/* Bell 2: On the secret southern sugar ledge below cliff */}
      <HiddenBell id="bell_candy_2" position={[52, 2.2, 35]} name="Sugar Ledge Bell" />
    </group>
  );
};
