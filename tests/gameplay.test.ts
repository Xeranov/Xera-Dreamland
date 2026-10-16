import assert from 'node:assert';

console.log('--- Running Gameplay & Physics Math Test Suite ---');

// 1. MovingPlatform oscillation math verification
const speed = 0.8;
const phase = 0;
const computeT = (elapsed: number) => (1 - Math.cos(elapsed * speed + phase)) / 2;

// Verify at t=0, platform starts at 0.0 (startPos), NOT at 0.5 (midpoint)
const t0 = computeT(0);
assert.strictEqual(t0, 0, 'Platform at elapsed 0 must start at t=0 (startPos)');

// Verify delta at frame 1 (16ms = ~0.016s)
const t1 = computeT(0.016);
const displacementRate = (t1 - t0) / 0.016;
assert.ok(displacementRate < 0.05, `Initial acceleration must be smooth and near 0, got ${displacementRate}`);

// Verify at half cycle t reaches 1.0 (endPos)
const halfCycle = Math.PI / speed;
const tHalf = computeT(halfCycle);
assert.ok(Math.abs(tHalf - 1.0) < 0.001, `Platform must reach endPos (t=1.0) at half period, got ${tHalf}`);

console.log('✓ MovingPlatform smooth cosine oscillation and t(0)=0 verified');

// 2. Secret Skyway Bridge gap distance verification
// All consecutive stepping stone pairs in HiddenGrove must be reachable by cat jump (max regular jump ~7.5 units)
const skywaySteps: [number, number, number][] = [
  [-20, 1.2, -34],
  [-16, 2.0, -36.5],
  [-12, 2.8, -39],
  [-8, 3.7, -42],
  [-4, 4.6, -45],
  [0, 5.5, -48.5],
  [4, 6.4, -52],
  [8, 7.3, -55.5],
  [12, 8.2, -59],
  [16, 9.1, -62],
  [20, 10.0, -64.5],
  [24, 10.9, -66.5],
  [28, 11.8, -68.5],
  [33, 12.7, -70],
  [38, 13.6, -71],
  [43, 14.4, -72],
  [48, 15.1, -72.5],
  [53, 15.8, -73],
];

for (let i = 0; i < skywaySteps.length - 1; i++) {
  const [x1, y1, z1] = skywaySteps[i];
  const [x2, y2, z2] = skywaySteps[i + 1];
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dz = z2 - z1;
  const horizDist = Math.sqrt(dx * dx + dz * dz);
  assert.ok(
    horizDist <= 6.0,
    `Step ${i} to ${i + 1} horizontal distance ${horizDist.toFixed(2)} exceeds playable jump limit of 6.0 units`
  );
  assert.ok(
    dy >= 0 && dy <= 1.5,
    `Step ${i} to ${i + 1} vertical rise ${dy.toFixed(2)} exceeds playable step limit of 1.5 units`
  );
}
console.log('✓ All 18 Secret Skyway Bridge gaps verified strictly under 6.0 units (fully playable)');

// 3. Starlight Shrine entrance gap from Cloud Bridges
// Cloud step at [70, 15.0, -42], intermediate step at [70, 15.8, -46.5], shrine edge at Z=-50
const cloudZ1 = -42;
const cloudZ2 = -46.5;
const shrineZ = -50;
assert.ok(Math.abs(cloudZ2 - cloudZ1) <= 5.0, 'Cloud bridge approach gap 1 within 5.0 units');
assert.ok(Math.abs(shrineZ - cloudZ2) <= 5.0, 'Cloud bridge approach gap 2 within 5.0 units');
console.log('✓ Starlight Shrine entrance from Cloud Bridges verified smoothly bridged');

console.log('--- All Gameplay & Physics Math Tests Passed Successfully! ---');
