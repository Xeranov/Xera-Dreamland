export interface GameSettings {
  musicVolume: number;
  sfxVolume: number;
  sensitivity: number;
  reducedMotion: boolean;
  quality: 'low' | 'medium' | 'high';
}

export interface SaveData {
  version: number;
  collectedStarIds: string[];
  collectedBellIds: string[];
  unlockedAccessories: string[];
  equippedAccessory: string | null;
  shrineCompleted: boolean;
  checkpointId: string;
  checkpointPosition: [number, number, number];
  settings: GameSettings;
}

const STORAGE_KEY = 'xeranov_dreamland_save_v1';

export const DEFAULT_SAVE_DATA: SaveData = {
  version: 2,
  collectedStarIds: [],
  collectedBellIds: [],
  unlockedAccessories: [],
  equippedAccessory: null,
  shrineCompleted: false,
  checkpointId: 'sakura_start',
  checkpointPosition: [0, 1.5, 0],
  settings: {
    musicVolume: 0.5,
    sfxVolume: 0.8,
    sensitivity: 1.0,
    reducedMotion: false,
    quality: 'medium',
  },
};

type SaveChangeListener = (data: SaveData) => void;

class SaveManagerClass {
  private currentData: SaveData;
  private listeners: Set<SaveChangeListener> = new Set();
  private saveTimeout: number | null = null;

  constructor() {
    this.currentData = this.loadFromStorage();
  }

  public getData(): Readonly<SaveData> {
    return this.currentData;
  }

  public subscribe(listener: SaveChangeListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.currentData));
  }

  private loadFromStorage(): SaveData {
    if (typeof window === 'undefined' || !window.localStorage) {
      return { ...DEFAULT_SAVE_DATA };
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_SAVE_DATA };

      const parsed = JSON.parse(raw);
      if (typeof parsed !== 'object' || parsed === null) {
        return { ...DEFAULT_SAVE_DATA };
      }

      const bellIds: string[] = Array.isArray(parsed.collectedBellIds)
        ? parsed.collectedBellIds.filter((id: unknown): id is string => typeof id === 'string')
        : [];

      const shrineDone = Boolean(parsed.shrineCompleted);

      // Auto-unlock accessories based on bell count & shrine completion
      const unlocked: string[] = Array.isArray(parsed.unlockedAccessories)
        ? parsed.unlockedAccessories.filter((id: unknown): id is string => typeof id === 'string')
        : [];

      if (bellIds.length >= 3 && !unlocked.includes('flower_pin')) {
        unlocked.push('flower_pin');
      }
      if (bellIds.length >= 6 && !unlocked.includes('ribbon_bow')) {
        unlocked.push('ribbon_bow');
      }
      if (shrineDone && !unlocked.includes('starlight_crown')) {
        unlocked.push('starlight_crown');
      }

      const equipped =
        typeof parsed.equippedAccessory === 'string' && unlocked.includes(parsed.equippedAccessory)
          ? parsed.equippedAccessory
          : null;

      // Validate schema with backward compatibility
      const validated: SaveData = {
        version: typeof parsed.version === 'number' ? parsed.version : DEFAULT_SAVE_DATA.version,
        collectedStarIds: Array.isArray(parsed.collectedStarIds)
          ? parsed.collectedStarIds.filter((id: unknown): id is string => typeof id === 'string')
          : [],
        collectedBellIds: bellIds,
        unlockedAccessories: unlocked,
        equippedAccessory: equipped,
        shrineCompleted: shrineDone,
        checkpointId: typeof parsed.checkpointId === 'string' ? parsed.checkpointId : DEFAULT_SAVE_DATA.checkpointId,
        checkpointPosition:
          Array.isArray(parsed.checkpointPosition) && parsed.checkpointPosition.length === 3
            ? [parsed.checkpointPosition[0], parsed.checkpointPosition[1], parsed.checkpointPosition[2]]
            : DEFAULT_SAVE_DATA.checkpointPosition,
        settings: {
          musicVolume:
            typeof parsed.settings?.musicVolume === 'number'
              ? Math.max(0, Math.min(1, parsed.settings.musicVolume))
              : DEFAULT_SAVE_DATA.settings.musicVolume,
          sfxVolume:
            typeof parsed.settings?.sfxVolume === 'number'
              ? Math.max(0, Math.min(1, parsed.settings.sfxVolume))
              : DEFAULT_SAVE_DATA.settings.sfxVolume,
          sensitivity:
            typeof parsed.settings?.sensitivity === 'number'
              ? Math.max(0.2, Math.min(3, parsed.settings.sensitivity))
              : DEFAULT_SAVE_DATA.settings.sensitivity,
          reducedMotion:
            typeof parsed.settings?.reducedMotion === 'boolean'
              ? parsed.settings.reducedMotion
              : DEFAULT_SAVE_DATA.settings.reducedMotion,
          quality:
            parsed.settings?.quality === 'low' || parsed.settings?.quality === 'high'
              ? parsed.settings.quality
              : 'medium',
        },
      };

      return validated;
    } catch (err) {
      console.warn('[SaveManager] Failed to read save data, falling back to default:', err);
      return { ...DEFAULT_SAVE_DATA };
    }
  }

  private scheduleWrite() {
    if (this.saveTimeout !== null) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = window.setTimeout(() => {
      this.writeImmediately();
      this.saveTimeout = null;
    }, 200);
  }

  private writeImmediately() {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.currentData));
    } catch (err) {
      console.error('[SaveManager] Failed to persist save data:', err);
    }
  }

  public collectStar(starId: string): boolean {
    if (this.currentData.collectedStarIds.includes(starId)) {
      return false;
    }
    this.currentData = {
      ...this.currentData,
      collectedStarIds: [...this.currentData.collectedStarIds, starId],
    };
    this.notify();
    this.scheduleWrite();
    return true;
  }

  public isStarCollected(starId: string): boolean {
    return this.currentData.collectedStarIds.includes(starId);
  }

  public collectBell(bellId: string): boolean {
    if (this.currentData.collectedBellIds.includes(bellId)) {
      return false;
    }
    const nextBellIds = [...this.currentData.collectedBellIds, bellId];
    const nextUnlocked = [...this.currentData.unlockedAccessories];

    if (nextBellIds.length >= 3 && !nextUnlocked.includes('flower_pin')) {
      nextUnlocked.push('flower_pin');
    }
    if (nextBellIds.length >= 6 && !nextUnlocked.includes('ribbon_bow')) {
      nextUnlocked.push('ribbon_bow');
    }

    this.currentData = {
      ...this.currentData,
      collectedBellIds: nextBellIds,
      unlockedAccessories: nextUnlocked,
    };
    this.notify();
    this.scheduleWrite();
    return true;
  }

  public isBellCollected(bellId: string): boolean {
    return this.currentData.collectedBellIds.includes(bellId);
  }

  public completeShrine(): boolean {
    if (this.currentData.shrineCompleted) return false;
    const nextUnlocked = [...this.currentData.unlockedAccessories];
    if (!nextUnlocked.includes('starlight_crown')) {
      nextUnlocked.push('starlight_crown');
    }
    this.currentData = {
      ...this.currentData,
      shrineCompleted: true,
      unlockedAccessories: nextUnlocked,
    };
    this.notify();
    this.scheduleWrite();
    return true;
  }

  public isShrineCompleted(): boolean {
    return this.currentData.shrineCompleted;
  }

  public equipAccessory(accessoryId: string | null) {
    if (accessoryId !== null) {
      const isUnlocked =
        this.currentData.unlockedAccessories.includes(accessoryId) ||
        (accessoryId === 'flower_pin' && this.currentData.collectedBellIds.length >= 3) ||
        (accessoryId === 'ribbon_bow' && this.currentData.collectedBellIds.length >= 6) ||
        (accessoryId === 'starlight_crown' && this.currentData.shrineCompleted);

      if (!isUnlocked) {
        return;
      }

      if (!this.currentData.unlockedAccessories.includes(accessoryId)) {
        this.currentData.unlockedAccessories.push(accessoryId);
      }
    }
    this.currentData = {
      ...this.currentData,
      equippedAccessory: accessoryId,
    };
    this.notify();
    this.scheduleWrite();
  }

  public unlockAccessory(accessoryId: string) {
    if (this.currentData.unlockedAccessories.includes(accessoryId)) return;
    this.currentData = {
      ...this.currentData,
      unlockedAccessories: [...this.currentData.unlockedAccessories, accessoryId],
    };
    this.notify();
    this.scheduleWrite();
  }

  public setCheckpoint(id: string, position: [number, number, number]) {
    if (this.currentData.checkpointId === id) return;
    this.currentData = {
      ...this.currentData,
      checkpointId: id,
      checkpointPosition: position,
    };
    this.notify();
    this.scheduleWrite();
  }

  public updateSettings(partial: Partial<GameSettings>) {
    this.currentData = {
      ...this.currentData,
      settings: {
        ...this.currentData.settings,
        ...partial,
      },
    };
    this.notify();
    this.scheduleWrite();
  }

  public resetProgress() {
    this.currentData = {
      ...DEFAULT_SAVE_DATA,
      settings: { ...this.currentData.settings }, // Keep user settings preferences
    };
    this.notify();
    this.writeImmediately();
  }
}

export const SaveManager = new SaveManagerClass();
