export const GAME_CONFIG = {
  player: {
    maxSpeed: 7.5,
    acceleration: 45,
    deceleration: 40,
    turnSpeed: 14,
    airControl: 0.65,
    gravityMultiplier: 1.6,
    jumpImpulse: 8.2,
    coyoteTimeMs: 130,
    jumpBufferMs: 160,
    dashSpeed: 18.0,
    dashDurationMs: 220,
    dashCooldownMs: 1100,
    colliderRadius: 0.35,
    colliderHeight: 0.5,
  },
  world: {
    fallThresholdY: -12,
    defaultSpawn: [0, 2, 0] as [number, number, number],
  },
  camera: {
    defaultDistance: 6.2,
    minDistance: 3.0,
    maxDistance: 12.0,
    minPitch: (-15 * Math.PI) / 180,
    maxPitch: (72 * Math.PI) / 180,
    smoothFactor: 0.1,
    defaultSensitivity: 1.0,
  },
  audio: {
    defaultMusicVolume: 0.45,
    defaultSfxVolume: 0.8,
  },
} as const;

export type GameConfig = typeof GAME_CONFIG;
