import React from 'react';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { Collectible } from '../../objects/Collectible';
import { HiddenBell } from '../../objects/HiddenBell';
import { MovingPlatform } from '../../objects/MovingPlatform';
import { Checkpoint } from '../../objects/Checkpoint';

// Stationary Pillowy Stepping Cloud Component
const SteppingCloud: React.FC<{
  position: [number, number, number];
  size?: [number, number, number];
  color?: string;
}> = ({ position, size = [3.2, 0.7, 3.2], color = '#FFFFFF' }) => {
  const halfW = size[0] / 2;
  const halfH = size[1] / 2;
  const halfD = size[2] / 2;

  return (
    <group position={position}>
      <RigidBody type="fixed" colliders={false} friction={0.8}>
        <CuboidCollider args={[halfW, halfH, halfD]} position={[0, halfH, 0]} />
      </RigidBody>
      <group position={[0, halfH, 0]}>
        {/* Core Cloud Slab */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={size} />
          <meshStandardMaterial color={color} roughness={0.35} />
        </mesh>
        {/* Fluffy Rounded Spheres around perimeter */}
        <mesh position={[-halfW * 0.9, 0, 0]} scale={[1, 0.9, 1]}>
          <sphereGeometry args={[halfH * 1.5, 12, 12]} />
          <meshStandardMaterial color="#FFF9FC" roughness={0.35} />
        </mesh>
        <mesh position={[halfW * 0.9, 0, 0]} scale={[1, 0.9, 1]}>
          <sphereGeometry args={[halfH * 1.5, 12, 12]} />
          <meshStandardMaterial color="#FFF9FC" roughness={0.35} />
        </mesh>
        <mesh position={[0, 0, -halfD * 0.9]} scale={[1, 0.9, 1]}>
          <sphereGeometry args={[halfH * 1.5, 12, 12]} />
          <meshStandardMaterial color="#FFF9FC" roughness={0.35} />
        </mesh>
        <mesh position={[0, 0, halfD * 0.9]} scale={[1, 0.9, 1]}>
          <sphereGeometry args={[halfH * 1.5, 12, 12]} />
          <meshStandardMaterial color="#FFF9FC" roughness={0.35} />
        </mesh>
        {/* Underside soft shadow belly */}
        <mesh position={[0, -halfH * 0.6, 0]} scale={[halfW * 0.95, halfH * 0.85, halfD * 0.95]}>
          <sphereGeometry args={[1, 14, 14]} />
          <meshStandardMaterial color="#EAE8F7" roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
};

export const CloudBridges: React.FC = () => {
  return (
    <group>
      {/* ---------------- 1. Stationary Stepping Clouds (Ascending Staircase) ---------------- */}
      {/* Cloud Step 1: Connecting from Candy Garden exit */}
      <SteppingCloud position={[67, 5.8, 8]} size={[3.0, 0.6, 3.0]} />

      {/* ---------------- 2. Kinematic Moving Cloud Platforms ---------------- */}
      {/* Cloud Shuttle 1: Horizontal Shuttle between Cloud Step 1 and Lift Base */}
      <MovingPlatform
        startPos={[69, 6.2, 5]}
        endPos={[75, 6.2, -1]}
        speed={0.9}
        size={[3.2, 0.6, 3.2]}
        color="#FFF4F8"
      />

      {/* Intermediate Cloud Anchor before Lift */}
      <SteppingCloud position={[76, 6.5, -4]} size={[3.4, 0.7, 3.4]} color="#FFF8FA" />

      {/* Cloud Lift 1: Vertical Kinematic Elevator ascending into the stratosphere! */}
      <MovingPlatform
        startPos={[76, 7.0, -8]}
        endPos={[76, 12.0, -8]}
        speed={0.75}
        size={[3.2, 0.6, 3.2]}
        color="#F8F2FF"
      />

      {/* ---------------- 3. Cloud Rest Mid-way Sanctuary Island ---------------- */}
      <SteppingCloud position={[76, 11.8, -13]} size={[6.0, 0.8, 6.0]} color="#FFFFFF" />

      {/* Side Detour Wispy Stepping Clouds */}
      <SteppingCloud position={[82, 12.4, -15]} size={[2.4, 0.5, 2.4]} color="#FFF0F5" />
      <SteppingCloud position={[85, 13.2, -18]} size={[2.2, 0.5, 2.2]} color="#EBF4FF" />

      {/* Lower Secret Alcove Cloud under Sanctuary */}
      <SteppingCloud position={[76, 9.2, -13]} size={[2.8, 0.5, 2.8]} color="#E8E4F5" />

      {/* ---------------- 4. Kinematic Moving Platform: High Altitude Sky Shuttle ---------------- */}
      {/* Cloud Shuttle 2: Horizontal shuttle traversing the celestial abyss to Starlight Shrine */}
      <MovingPlatform
        startPos={[74, 13.2, -18]}
        endPos={[70, 13.2, -32]}
        speed={0.85}
        phase={0}
        size={[3.4, 0.6, 3.4]}
        color="#F4EDFF"
      />

      {/* Stepping Clouds approaching Starlight Shrine Gate */}
      <SteppingCloud position={[70, 14.2, -36]} size={[3.5, 0.7, 3.5]} color="#FFF4F8" />
      <SteppingCloud position={[70, 15.0, -42]} size={[4.2, 0.8, 4.2]} color="#F0EAFF" />
      <SteppingCloud position={[70, 15.8, -46.5]} size={[4.0, 0.8, 4.0]} color="#EAE4FF" />

      {/* ---------------- 5. Mid-way Checkpoint ---------------- */}
      <Checkpoint id="checkpoint_cloud" position={[76, 12.2, -13]} name="Cloud Rest Point" />

      {/* ---------------- 6. Star Fragments (Zone C: 6 Stars) ---------------- */}
      {/* Star 1: On the initial cloud step from Candy Garden */}
      <Collectible id="star_cloud_1" position={[67, 7.0, 8]} />
      {/* Star 2: Hovering in the middle of Cloud Shuttle 1 path */}
      <Collectible id="star_cloud_2" position={[72, 7.5, 2]} />
      {/* Star 3: At the peak elevation of Cloud Lift 1 */}
      <Collectible id="star_cloud_3" position={[76, 13.4, -8]} />
      {/* Star 4: On the airy detour stepping cloud */}
      <Collectible id="star_cloud_4" position={[82, 13.8, -15]} />
      {/* Star 5: Floating high above Cloud Shuttle 2 abyss */}
      <Collectible id="star_cloud_5" position={[72, 14.6, -25]} />
      {/* Star 6: At the summit cloud overlook before Starlight Shrine */}
      <Collectible id="star_cloud_6" position={[70, 16.4, -42]} />

      {/* ---------------- 7. Hidden Bells (Zone C: 2 Bells) ---------------- */}
      {/* Bell 1: Tucked beneath the Cloud Rest sanctuary ledge */}
      <HiddenBell id="bell_cloud_1" position={[76, 10.4, -13]} name="Undercloud Ledge Bell" />
      {/* Bell 2: High wind wispy cloud requiring dash */}
      <HiddenBell id="bell_cloud_2" position={[85, 14.5, -18]} name="Stratosphere Whisper Bell" />
    </group>
  );
};
