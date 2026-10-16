export interface GameSettings {
  musicVolume: number;
  sfxVolume: number;
  sensitivity: number;
  reducedMotion: boolean;
}

export interface SaveData {
  version: number;
  collectedStarIds: string[];
  collectedBellIds: string[];
  checkpointId: string;
  checkpointPosition: [number, number, number];
  settings: GameSettings;
}

const STORAGE_KEY = 'xeranov_dreamland_save_v1';

export const DEFAULT_SAVE_DATA: SaveData = {
  version: 1,
  collectedStarIds: [],
  collectedBellIds: [],
  checkpointId: 'sakura_start',
  checkpointPosition: [0, 1.5, 0],
  settings: {
    musicVolume: 0.5,
    sfxVolume: 0.8,
    sensitivity: 1.0,
    reducedMotion: false,
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
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_SAVE_DATA };

      const parsed = JSON.parse(raw);
      if (typeof parsed !== 'object' || parsed === null) {
        return { ...DEFAULT_SAVE_DATA };
      }

      // Validate schema
      const validated: SaveData = {
        version: typeof parsed.version === 'number' ? parsed.version : DEFAULT_SAVE_DATA.version,
        collectedStarIds: Array.isArray(parsed.collectedStarIds) ? parsed.collectedStarIds : [],
        collectedBellIds: Array.isArray(parsed.collectedBellIds) ? parsed.collectedBellIds : [],
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.currentData));
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
