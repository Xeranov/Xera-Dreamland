import React, { useState, useEffect } from 'react';
import { GameState, GameStateData } from '../game/systems/GameState';
import { AudioManager } from '../game/systems/AudioManager';
import { Sparkles, Pause, Volume2, VolumeX, Zap, Bell } from 'lucide-react';

interface HUDProps {
  onOpenPause: () => void;
}

export const HUD: React.FC<HUDProps> = ({ onOpenPause }) => {
  const [gameState, setGameState] = useState<GameStateData>(GameState.getState());
  const [isMuted, setIsMuted] = useState<boolean>(false);

  useEffect(() => {
    return GameState.subscribe((state) => {
      setGameState({ ...state });
    });
  }, []);

  const handleToggleMute = () => {
    const muted = AudioManager.toggleMute();
    setIsMuted(muted);
  };

  const handleMeow = () => {
    AudioManager.playMeow();
    GameState.touch.meowPressed = true;
    setTimeout(() => {
      GameState.touch.meowPressed = false;
    }, 150);
  };

  const handleOpenInventory = () => {
    GameState.toggleInventory();
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-4 md:p-6">
      {/* Top Bar */}
      <div className="w-full flex items-start justify-between">
        {/* Left Counters Cluster */}
        <div className="flex items-center space-x-2.5 pointer-events-auto">
          {/* Star Counter Pill */}
          <div className="dream-glass px-3.5 py-2 md:px-4 md:py-2.5 rounded-full flex items-center space-x-2.5 shadow-md">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#FFDF6D] flex items-center justify-center text-[#996B00] shadow-sm animate-pulse-glow">
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] md:text-xs uppercase tracking-wider font-extrabold text-[#E887B7]">
                Stars
              </span>
              <span className="text-lg md:text-xl font-extrabold text-[#49354F] leading-none">
                {gameState.collectedStarsCount}{' '}
                <span className="text-xs md:text-sm font-semibold text-[#8C7A92]">/ 24</span>
              </span>
            </div>
          </div>

          {/* Hidden Bells Counter Pill */}
          <div className="dream-glass px-3.5 py-2 md:px-4 md:py-2.5 rounded-full flex items-center space-x-2.5 shadow-md">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#FCD34D] flex items-center justify-center text-[#8C6200] shadow-sm">
              <Bell className="w-4 h-4 md:w-5 md:h-5 fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] md:text-xs uppercase tracking-wider font-extrabold text-[#D49826]">
                Bells
              </span>
              <span className="text-lg md:text-xl font-extrabold text-[#49354F] leading-none">
                {gameState.collectedBellsCount}{' '}
                <span className="text-xs md:text-sm font-semibold text-[#8C7A92]">/ 8</span>
              </span>
            </div>
          </div>
        </div>

        {/* Center Banner Notification */}
        {gameState.bannerMessage && (
          <div className="absolute left-1/2 -translate-x-1/2 top-4 md:top-6 pointer-events-none max-w-[85vw] z-50">
            <div className="bg-[#FFF4F8]/95 px-5 py-2.5 md:px-6 md:py-3 rounded-2xl shadow-xl flex items-center space-x-2 border-2 border-[#F6A9D2] animate-bounce-subtle text-center transform-gpu">
              <span className="text-sm md:text-base font-bold text-[#49354F]">
                {gameState.bannerMessage}
              </span>
            </div>
          </div>
        )}

        {/* Top-Right Control Buttons */}
        <div className="flex items-center space-x-2 pointer-events-auto">
          {/* Inventory Backpack Button */}
          <button
            onClick={handleOpenInventory}
            aria-label="Open Inventory Wardrobe"
            title="Inventory [I]"
            className="w-11 h-11 rounded-full dream-glass flex items-center justify-center text-xl hover:border-[#E887B7] hover:scale-105 transition-all shadow-md"
          >
            🎒
          </button>
          <button
            onClick={handleToggleMute}
            aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="w-11 h-11 rounded-full dream-glass flex items-center justify-center text-[#49354F] hover:text-[#E887B7] hover:border-[#E887B7] transition-all"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <button
            onClick={onOpenPause}
            aria-label="Pause Game"
            className="w-11 h-11 rounded-full dream-glass flex items-center justify-center text-[#49354F] hover:text-[#E887B7] hover:border-[#E887B7] transition-all"
          >
            <Pause className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Center Proximity Interaction Prompt */}
      {gameState.interactionPrompt && (
        <div className="self-center mb-8 pointer-events-none">
          <div className="dream-glass px-5 py-2.5 rounded-full border border-[#F6A9D2] shadow-lg animate-pulse">
            <span className="text-sm md:text-base font-bold text-[#49354F]">
              {gameState.interactionPrompt}
            </span>
          </div>
        </div>
      )}

      {/* Bottom Desktop Actions Bar */}
      <div className="w-full hidden md:flex items-end justify-between">
        {/* Desktop Quick Keys Help */}
        <div className="dream-glass px-4 py-2 rounded-2xl text-xs font-semibold text-[#66506C] flex items-center space-x-3 pointer-events-auto">
          <span><kbd className="bg-white/70 px-1.5 py-0.5 rounded shadow-sm text-xs">WASD</kbd> Move</span>
          <span><kbd className="bg-white/70 px-1.5 py-0.5 rounded shadow-sm text-xs">Space</kbd> Jump</span>
          <span><kbd className="bg-white/70 px-1.5 py-0.5 rounded shadow-sm text-xs">Shift</kbd> Dash</span>
          <span><kbd className="bg-white/70 px-1.5 py-0.5 rounded shadow-sm text-xs">I</kbd> Journal</span>
          <span><kbd className="bg-white/70 px-1.5 py-0.5 rounded shadow-sm text-xs">M</kbd> Meow</span>
          <span><kbd className="bg-white/70 px-1.5 py-0.5 rounded shadow-sm text-xs">Drag</kbd> Orbit Cam</span>
        </div>

        {/* Dash Cooldown & Meow Trigger Button */}
        <div className="flex items-center space-x-3 pointer-events-auto">
          {/* Dash Cooldown Ring */}
          <div className="dream-glass px-3.5 py-2 rounded-2xl flex items-center space-x-2">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <svg className="w-8 h-8 transform -rotate-90">
                <circle
                  cx="16"
                  cy="16"
                  r="13"
                  className="stroke-[#E8DCE4]"
                  strokeWidth="3"
                  fill="transparent"
                />
                <circle
                  cx="16"
                  cy="16"
                  r="13"
                  className="stroke-[#E887B7] transition-all duration-75"
                  strokeWidth="3"
                  strokeDasharray={81.68}
                  strokeDashoffset={81.68 * (1 - gameState.dashCooldown)}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <Zap className={`w-3.5 h-3.5 absolute ${gameState.dashCooldown >= 1 ? 'text-[#E887B7]' : 'text-gray-400'}`} />
            </div>
            <span className="text-xs font-bold text-[#49354F]">
              {gameState.dashCooldown >= 1 ? 'Dash Ready' : 'Recharging...'}
            </span>
          </div>

          {/* Interactive Desktop Meow Button */}
          <button
            onClick={handleMeow}
            className="dream-button px-5 py-2.5 flex items-center space-x-2 text-sm shadow-md"
          >
            <span>🐾 Meow!</span>
          </button>
        </div>
      </div>
    </div>
  );
};
