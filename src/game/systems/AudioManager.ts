import { SaveManager } from './SaveManager';

class AudioManagerClass {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private isMuted: boolean = false;
  private isInitialized: boolean = false;
  private ambientInterval: number | null = null;
  private chordIndex: number = 0;

  constructor() {
    // Listen for settings changes
    SaveManager.subscribe((data) => {
      this.setMusicVolume(data.settings.musicVolume);
      this.setSfxVolume(data.settings.sfxVolume);
    });
  }

  public init() {
    if (this.isInitialized) {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master Gains
      this.musicGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();

      const saved = SaveManager.getData();
      this.musicGain.gain.setValueAtTime(saved.settings.musicVolume * 0.4, this.ctx.currentTime);
      this.sfxGain.gain.setValueAtTime(saved.settings.sfxVolume, this.ctx.currentTime);

      this.musicGain.connect(this.ctx.destination);
      this.sfxGain.connect(this.ctx.destination);

      this.isInitialized = true;
      this.startAmbientMusic();
    } catch (e) {
      console.warn('[AudioManager] Web Audio API not supported or blocked:', e);
    }
  }

  public setMusicVolume(vol: number) {
    if (!this.ctx || !this.musicGain) return;
    const clamped = Math.max(0, Math.min(1, vol));
    this.musicGain.gain.setTargetAtTime(this.isMuted ? 0 : clamped * 0.4, this.ctx.currentTime, 0.05);
  }

  public setSfxVolume(vol: number) {
    if (!this.ctx || !this.sfxGain) return;
    const clamped = Math.max(0, Math.min(1, vol));
    this.sfxGain.gain.setTargetAtTime(this.isMuted ? 0 : clamped, this.ctx.currentTime, 0.05);
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    const saved = SaveManager.getData();
    this.setMusicVolume(saved.settings.musicVolume);
    this.setSfxVolume(saved.settings.sfxVolume);
    return this.isMuted;
  }

  // --- Kawaii Meow ---
  public playMeow() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Dual oscillator with formant filter for vocal "m-e-o-w"
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc1.type = 'triangle';
    osc2.type = 'sine';

    // Pitch rises then falls: 550Hz -> 820Hz -> 480Hz
    osc1.frequency.setValueAtTime(550, now);
    osc1.frequency.exponentialRampToValueAtTime(820, now + 0.12);
    osc1.frequency.exponentialRampToValueAtTime(480, now + 0.38);

    osc2.frequency.setValueAtTime(555, now);
    osc2.frequency.exponentialRampToValueAtTime(825, now + 0.12);
    osc2.frequency.exponentialRampToValueAtTime(482, now + 0.38);

    // Formant sweep (like opening mouth "meee-ow")
    filter.type = 'bandpass';
    filter.Q.setValueAtTime(3.0, now);
    filter.frequency.setValueAtTime(1100, now);
    filter.frequency.exponentialRampToValueAtTime(2400, now + 0.14);
    filter.frequency.exponentialRampToValueAtTime(800, now + 0.38);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.4, now + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.42);
    osc2.stop(now + 0.42);
  }

  // --- Star Fragment Collect Sparkles ---
  public playStarCollect() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Pentatonic arpeggio chime: C6 (1046Hz), E6 (1318Hz), G6 (1567Hz), B6 (1975Hz), C7 (2093Hz)
    const freqs = [1046.5, 1318.5, 1567.9, 1975.5, 2093.0];
    freqs.forEach((freq, i) => {
      if (!this.ctx || !this.sfxGain) return;
      const t = now + i * 0.055;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.28, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.38);
    });
  }

  // --- Bounce Mushroom Boing ---
  public playBounce() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    // Frequency sweeps from 180Hz up to 580Hz with wobble
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(580, now + 0.16);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.35);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.5, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.42);
  }

  // --- Jump Whoosh ---
  public playJump() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(490, now + 0.14);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  // --- Land Thud ---
  public playLand() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  // --- Dash Whoosh ---
  public playDash() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.08);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.exponentialRampToValueAtTime(1800, now + 0.06);
    filter.frequency.exponentialRampToValueAtTime(400, now + 0.22);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.28, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.26);
  }

  // --- Footstep ---
  public playFootstep() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const randFreq = 220 + Math.random() * 40;
    osc.frequency.setValueAtTime(randFreq, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.04);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  // --- Checkpoint Bell ---
  public playCheckpoint() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(880, now); // A5
    osc2.frequency.setValueAtTime(1320, now); // E6

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.85);
    osc2.stop(now + 0.85);
  }

  // --- Hidden Bell Chime ---
  public playBellChime() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Harmonic bell chord: E6 (1318.5Hz), G#6 (1661.2Hz), B6 (1975.5Hz), E7 (2637.0Hz)
    const bellPitches = [1318.5, 1661.2, 1975.5, 2637.0, 3951.0];
    bellPitches.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const t = now + idx * 0.04;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.24 / (idx * 0.35 + 1), t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0008, t + 0.7);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.75);
    });
  }

  // --- Starlight Gate Open ---
  public playGateOpen() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Deep resonant rumble
    const oscBass = this.ctx.createOscillator();
    const bassGain = this.ctx.createGain();
    oscBass.type = 'triangle';
    oscBass.frequency.setValueAtTime(110, now);
    oscBass.frequency.exponentialRampToValueAtTime(220, now + 1.2);
    bassGain.gain.setValueAtTime(0.01, now);
    bassGain.gain.linearRampToValueAtTime(0.35, now + 0.1);
    bassGain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
    oscBass.connect(bassGain);
    bassGain.connect(this.sfxGain);
    oscBass.start(now);
    oscBass.stop(now + 1.5);

    // Celestial chime cascade
    const gateNotes = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98];
    gateNotes.forEach((freq, i) => {
      if (!this.ctx || !this.sfxGain) return;
      const t = now + 0.2 + i * 0.12;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.2, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.65);
    });
  }

  // --- Beacon Light Up ---
  public playBeaconActivate() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const freqs = [440, 554.37, 659.25, 880];
    freqs.forEach((freq, i) => {
      if (!this.ctx || !this.sfxGain) return;
      const t = now + i * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.22, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.55);
    });
  }

  // --- Shrine Victory Fanfare ---
  public playShrineVictory() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const arpeggio = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98, 2093.0];
    arpeggio.forEach((freq, i) => {
      if (!this.ctx || !this.sfxGain) return;
      const t = now + i * 0.1;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.3, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.95);
    });
  }

  // --- Ambient Music Loop (Pastel Dream Pads) ---
  private startAmbientMusic() {
    if (this.ambientInterval !== null) return;

    // Cute gentle chords: Fmaj7 -> Gsus4 -> Em7 -> Am7
    const chords = [
      [174.61, 220.0, 261.63, 329.63], // F, A, C, E
      [196.0, 261.63, 293.66, 392.0],  // G, C, D, G
      [164.81, 196.0, 246.94, 329.63], // E, G, B, E
      [220.0, 261.63, 329.63, 392.0],  // A, C, E, G
    ];

    const playNextChord = () => {
      if (!this.ctx || !this.musicGain) return;
      const now = this.ctx.currentTime;
      const notes = chords[this.chordIndex];
      this.chordIndex = (this.chordIndex + 1) % chords.length;

      notes.forEach((freq) => {
        if (!this.ctx || !this.musicGain) return;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(480, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.035, now + 1.2);
        gain.gain.linearRampToValueAtTime(0.025, now + 2.8);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.2);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);

        osc.start(now);
        osc.stop(now + 4.3);
      });
    };

    playNextChord();
    this.ambientInterval = window.setInterval(playNextChord, 4000);
  }
}

export const AudioManager = new AudioManagerClass();
