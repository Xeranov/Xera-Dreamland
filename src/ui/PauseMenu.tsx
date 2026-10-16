import React, { useState } from 'react';
import { GameState } from '../game/systems/GameState';
import { SaveManager } from '../game/systems/SaveManager';
import { AudioManager } from '../game/systems/AudioManager';
import { SettingsPanel } from './SettingsPanel';
import { Play, Settings, RotateCcw, Home } from 'lucide-react';

interface PauseMenuProps {
  onResume: () => void;
  onGoHome: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({ onResume, onGoHome }) => {
  const [view, setView] = useState<'menu' | 'settings'>('menu');

  const handleRespawnCheckpoint = () => {
    // Dispatch respawn or reposition
    const saved = SaveManager.getData();
    window.dispatchEvent(
      new CustomEvent('player-respawn', { detail: { pos: saved.checkpointPosition } })
    );
    AudioManager.playLand();
    GameState.showBanner('Teleported to checkpoint! 🐾');
    onResume();
  };

  if (view === 'settings') {
    return <SettingsPanel onBack={() => setView('menu')} />;
  }

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-[#FFF4F8]/80 backdrop-blur-md">
      <div className="max-w-sm w-full dream-glass rounded-3xl p-6 md:p-8 text-center shadow-2xl border-2 border-[#F6A9D2]/70 text-[#49354F] animate-bounce-subtle">
        {/* Title */}
        <h2 className="text-3xl font-extrabold text-[#49354F] mb-1">Paused 🌸</h2>
        <p className="text-xs font-semibold text-[#8C7A92] mb-6">Take a cozy cat breather</p>

        {/* Buttons List */}
        <div className="space-y-3">
          {/* Resume */}
          <button
            onClick={onResume}
            className="w-full dream-button py-3.5 flex items-center justify-center space-x-2 text-sm shadow-md"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Resume Game</span>
          </button>

          {/* Respawn at Checkpoint */}
          <button
            onClick={handleRespawnCheckpoint}
            className="w-full py-3 rounded-full bg-white/70 hover:bg-white text-[#49354F] font-bold text-xs flex items-center justify-center space-x-2 border border-[#F6A9D2]/40 transition-all shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Respawn at Checkpoint</span>
          </button>

          {/* Settings */}
          <button
            onClick={() => setView('settings')}
            className="w-full py-3 rounded-full bg-white/70 hover:bg-white text-[#49354F] font-bold text-xs flex items-center justify-center space-x-2 border border-[#F6A9D2]/40 transition-all shadow-sm"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Audio & Controls Settings</span>
          </button>

          {/* Main Menu */}
          <button
            onClick={onGoHome}
            className="w-full py-2.5 rounded-full text-[#8C7A92] hover:text-[#49354F] font-bold text-xs flex items-center justify-center space-x-1.5 transition-all"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Title</span>
          </button>
        </div>
      </div>
    </div>
  );
};
