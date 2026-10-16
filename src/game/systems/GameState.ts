import { SaveManager } from './SaveManager';

export type GameScreen = 'menu' | 'playing' | 'paused';

export interface TouchInputState {
  joystickVector: { x: number; y: number };
  cameraDelta: { x: number; y: number };
  jumpPressed: boolean;
  dashPressed: boolean;
  interactPressed: boolean;
  meowPressed: boolean;
}

export interface GameStateData {
  screen: GameScreen;
  interactionPrompt: string | null;
  dashCooldown: number; // 0 (on cooldown) to 1 (ready)
  bannerMessage: string | null;
  collectedStarsCount: number;
}

type StateListener = (state: GameStateData) => void;

class GameStateManager {
  private state: GameStateData = {
    screen: 'menu',
    interactionPrompt: null,
    dashCooldown: 1.0,
    bannerMessage: null,
    collectedStarsCount: SaveManager.getData().collectedStarIds.length,
  };

  public touch: TouchInputState = {
    joystickVector: { x: 0, y: 0 },
    cameraDelta: { x: 0, y: 0 },
    jumpPressed: false,
    dashPressed: false,
    interactPressed: false,
    meowPressed: false,
  };

  private listeners: Set<StateListener> = new Set();
  private bannerTimeout: number | null = null;

  constructor() {
    SaveManager.subscribe((saveData) => {
      this.state.collectedStarsCount = saveData.collectedStarIds.length;
      this.notify();
    });
  }

  public getState(): Readonly<GameStateData> {
    return this.state;
  }

  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.state));
  }

  public setScreen(screen: GameScreen) {
    this.state = { ...this.state, screen };
    this.notify();
  }

  public setInteractionPrompt(prompt: string | null) {
    if (this.state.interactionPrompt === prompt) return;
    this.state = { ...this.state, interactionPrompt: prompt };
    this.notify();
  }

  public setDashCooldown(progress: number) {
    this.state = { ...this.state, dashCooldown: progress };
    this.notify();
  }

  public showBanner(msg: string, durationMs: number = 2500) {
    if (this.bannerTimeout !== null) {
      clearTimeout(this.bannerTimeout);
    }
    this.state = { ...this.state, bannerMessage: msg };
    this.notify();

    this.bannerTimeout = window.setTimeout(() => {
      this.state = { ...this.state, bannerMessage: null };
      this.notify();
      this.bannerTimeout = null;
    }, durationMs);
  }
}

export const GameState = new GameStateManager();
