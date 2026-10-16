import React from 'react';
import { AudioManager } from '../game/systems/AudioManager';
import { GameState } from '../game/systems/GameState';
import { Sparkles, Play, Compass, Smartphone, Laptop } from 'lucide-react';

interface MainMenuProps {
  onStart: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStart }) => {
  const handlePlay = () => {
    // User interaction initializes Web Audio context cleanly
    AudioManager.init();
    AudioManager.playMeow();
    GameState.setScreen('playing');
    onStart();
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-[#FFF4F8]/80 backdrop-blur-md">
      <div className="max-w-md w-full dream-glass rounded-3xl p-6 md:p-8 text-center shadow-2xl border-2 border-[#F6A9D2]/60 animate-bounce-subtle">
        {/* Cute Mascot Badge */}
        <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-tr from-[#F6A9D2] to-[#FFF4F8] p-1 shadow-lg flex items-center justify-center">
          <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center text-4xl">
            🐾
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#49354F] tracking-tight mb-2">
          Xeranov Dreamland
        </h1>
        <p className="text-sm font-semibold text-[#8C7A92] mb-6">
          A cozy 3D vinyl cat exploration adventure 🌸
        </p>

        {/* Story / Mission Card */}
        <div className="bg-white/60 rounded-2xl p-4 mb-6 text-left text-xs space-y-2 text-[#49354F] border border-[#F6A9D2]/30">
          <div className="flex items-center space-x-2 font-bold text-[#E887B7] text-sm">
            <Sparkles className="w-4 h-4 fill-current" />
            <span>Sakura Meadow Expedition</span>
          </div>
          <p>
            Explore the tranquil floating island of Sakura Meadow. Leap across stepping stones, bounce on springy mushrooms, push candy blocks, and discover all <strong>6 Star Fragments</strong>!
          </p>
          <div className="pt-2 flex items-center justify-between text-[11px] text-[#66506C] border-t border-[#F6A9D2]/20">
            <span className="flex items-center gap-1"><Laptop className="w-3.5 h-3.5" /> Keyboard & Mouse</span>
            <span className="flex items-center gap-1"><Smartphone className="w-3.5 h-3.5" /> Mobile Touch</span>
          </div>
        </div>

        {/* Play Button */}
        <button
          onClick={handlePlay}
          className="w-full dream-button py-4 text-lg flex items-center justify-center space-x-2 shadow-lg mb-3"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>Start Exploring</span>
        </button>

        {/* Domain & Version Tag */}
        <div className="flex items-center justify-center space-x-2 text-xs font-semibold text-[#8C7A92]">
          <Compass className="w-3.5 h-3.5" />
          <span>xeranov.com • MVP v1.0</span>
        </div>
      </div>
    </div>
  );
};
