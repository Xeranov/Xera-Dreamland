// Test suite for SaveManager logic & migration
import assert from 'node:assert';

// Mock localStorage for node environment
const storage = new Map<string, string>();
(globalThis as any).window = {
  localStorage: {
    getItem: (k: string) => storage.get(k) ?? null,
    setItem: (k: string, v: string) => storage.set(k, v),
    removeItem: (k: string) => storage.delete(k),
    clear: () => storage.clear(),
  },
  setTimeout: (cb: () => void) => { cb(); return 0; },
  clearTimeout: () => {},
};

// Import SaveManager dynamically
const { SaveManager, DEFAULT_SAVE_DATA } = await import('../src/game/systems/SaveManager.ts');

console.log('--- Running SaveManager Test Suite ---');

// 1. Initial State
SaveManager.resetProgress();
const initial = SaveManager.getData();
assert.strictEqual(initial.version, 2, 'Version should be 2');
assert.strictEqual(initial.collectedStarIds.length, 0, 'Initial stars should be 0');
assert.strictEqual(initial.collectedBellIds.length, 0, 'Initial bells should be 0');
assert.strictEqual(initial.unlockedAccessories.length, 0, 'Initial accessories should be 0');
assert.strictEqual(initial.equippedAccessory, null, 'Initial equipped accessory should be null');
assert.strictEqual(initial.shrineCompleted, false, 'Initial shrine status should be false');
console.log('✓ Initial state verified');

// 2. Star Collection
assert.strictEqual(SaveManager.collectStar('star_meadow_1'), true, 'Should collect new star');
assert.strictEqual(SaveManager.collectStar('star_meadow_1'), false, 'Should not collect duplicate star');
assert.strictEqual(SaveManager.isStarCollected('star_meadow_1'), true, 'Star should be marked collected');
console.log('✓ Star collection verified');

// 3. Bell Collection & Accessory Unlock Milestones
assert.strictEqual(SaveManager.collectBell('bell_1'), true);
assert.strictEqual(SaveManager.collectBell('bell_2'), true);
assert.strictEqual(SaveManager.getData().unlockedAccessories.includes('flower_pin'), false, 'Flower pin not unlocked yet at 2 bells');

assert.strictEqual(SaveManager.collectBell('bell_3'), true);
assert.strictEqual(SaveManager.getData().unlockedAccessories.includes('flower_pin'), true, 'Flower pin unlocked at 3 bells');

assert.strictEqual(SaveManager.collectBell('bell_4'), true);
assert.strictEqual(SaveManager.collectBell('bell_5'), true);
assert.strictEqual(SaveManager.getData().unlockedAccessories.includes('ribbon_bow'), false, 'Ribbon bow not unlocked yet at 5 bells');

assert.strictEqual(SaveManager.collectBell('bell_6'), true);
assert.strictEqual(SaveManager.getData().unlockedAccessories.includes('ribbon_bow'), true, 'Ribbon bow unlocked at 6 bells');
console.log('✓ Bell collection and accessory unlocks verified');

// 4. Equipping Accessories
SaveManager.equipAccessory('flower_pin');
assert.strictEqual(SaveManager.getData().equippedAccessory, 'flower_pin', 'Flower pin equipped');

// Try equipping locked accessory
SaveManager.equipAccessory('starlight_crown');
assert.strictEqual(SaveManager.getData().equippedAccessory, 'flower_pin', 'Cannot equip locked crown');

SaveManager.equipAccessory(null);
assert.strictEqual(SaveManager.getData().equippedAccessory, null, 'Unequipped');
console.log('✓ Accessory equipping and guards verified');

// 5. Shrine Completion & Crown Unlock
assert.strictEqual(SaveManager.completeShrine(), true, 'First shrine completion returns true');
assert.strictEqual(SaveManager.completeShrine(), false, 'Second shrine completion returns false (already done)');
assert.strictEqual(SaveManager.isShrineCompleted(), true, 'Shrine completed');
assert.strictEqual(SaveManager.getData().unlockedAccessories.includes('starlight_crown'), true, 'Crown unlocked');

SaveManager.equipAccessory('starlight_crown');
assert.strictEqual(SaveManager.getData().equippedAccessory, 'starlight_crown', 'Can now equip crown');
console.log('✓ Shrine victory and Crown unlock verified');

// 6. Backward Compatibility Migration Test
storage.clear();
const v1Data = {
  version: 1,
  collectedStarIds: ['star_meadow_1', 'star_meadow_2'],
  collectedBellIds: ['bell_1', 'bell_2', 'bell_3', 'bell_4'],
  checkpointId: 'sakura_start',
  checkpointPosition: [0, 1.5, 0],
  settings: {
    musicVolume: 0.7,
    sfxVolume: 0.9,
    sensitivity: 1.2,
    reducedMotion: false,
  },
};
storage.set('xeranov_dreamland_save_v1', JSON.stringify(v1Data));

// Instantiate a new class to trigger loadFromStorage
const { SaveManager: MigratedManager } = await import(`../src/game/systems/SaveManager.ts?reload=${Date.now()}`);
// Check migrated properties directly
const migratedData = (MigratedManager as any).loadFromStorage();
assert.strictEqual(migratedData.collectedStarIds.length, 2, 'Retained 2 stars');
assert.strictEqual(migratedData.collectedBellIds.length, 4, 'Retained 4 bells');
assert.strictEqual(migratedData.unlockedAccessories.includes('flower_pin'), true, 'Auto-unlocked flower pin for 4 bells');
assert.strictEqual(migratedData.shrineCompleted, false, 'Shrine defaults to false');
assert.strictEqual(migratedData.settings.musicVolume, 0.7, 'Retained music volume');
console.log('✓ Backward-compatible v1 migration verified');

console.log('--- All SaveManager Tests Passed Successfully! ---');
