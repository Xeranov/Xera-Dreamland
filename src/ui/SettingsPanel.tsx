import React, { useState } from 'react';
import { SaveManager, GameSettings } from '../game/systems/SaveManager';
import { AudioManager } from '../game/systems/AudioManager';
import { GameState } from '../game/systems/GameState';
import { Volume2, Sliders, Eye, RotateCcw, ArrowLeft, Check } from 'lucide-react';

interface SettingsPanelProps {
  onBack: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ onBack }) => {
  const initialSettings = SaveManager.getData().settings;
  const [settings, setSettings] = useState<GameSettings>(initialSettings);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  const handleMusicChange = (val: number) => {
    const updated = { ...settings, musicVolume: val };
    setSettings(updated);
    SaveManager.updateSettings({ musicVolume: val });
  };

  const handleSfxChange = (val: number) => {
    const updated = { ...settings, sfxVolume: val };
    setSettings(updated);
    SaveManager.updateSettings({ sfxVolume: val });
    AudioManager.playFootstep();
  };

  const handleSensitivityChange = (val: number) => {
    const updated = { ...settings, sensitivity: val };
    setSettings(updated);
    SaveManager.updateSettings({ sensitivity: val });
  };

  const handleReducedMotionToggle = () => {
    const updated = { ...settings, reducedMotion: !settings.reducedMotion };
    setSettings(updated);
    SaveManager.updateSettings({ reducedMotion: updated.reducedMotion });
  };

  const handleResetProgress = () => {
    SaveManager.resetProgress();
    setShowResetConfirm(false);
    GameState.showBanner('Progress reset successfully! 🌸');
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-[#FFF4F8]/85 backdrop-blur-md">
      <div className="max-w-md w-full dream-glass rounded-3xl p-6 md:p-8 shadow-2xl border-2 border-[#F6A9D2]/70 text-[#49354F]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/70 flex items-center justify-center text-[#49354F] hover:bg-white transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-extrabold text-[#49354F]">Settings 🌸</h2>
          <div className="w-10" />
        </div>

        <div className="space-y-5 text-sm">
          {/* Music Volume */}
          <div className="bg-white/60 p-3.5 rounded-2xl border border-[#F6A9D2]/30">
            <div className="flex justify-between items-center mb-2 font-bold text-xs uppercase text-[#E887B7]">
              <span className="flex items-center gap-1.5"><Volume2 className="w-4 h-4" /> Music Volume</span>
              <span>{Math.round(settings.musicVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.musicVolume}
              onChange={(e) => handleMusicChange(parseFloat(e.target.value))}
              className="w-full accent-[#E887B7] cursor-pointer"
            />
          </div>

          {/* SFX Volume */}
          <div className="bg-white/60 p-3.5 rounded-2xl border border-[#F6A9D2]/30">
            <div className="flex justify-between items-center mb-2 font-bold text-xs uppercase text-[#E887B7]">
              <span className="flex items-center gap-1.5"><Volume2 className="w-4 h-4" /> SFX Volume</span>
              <span>{Math.round(settings.sfxVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.sfxVolume}
              onChange={(e) => handleSfxChange(parseFloat(e.target.value))}
              className="w-full accent-[#E887B7] cursor-pointer"
            />
          </div>

          {/* Camera Sensitivity */}
          <div className="bg-white/60 p-3.5 rounded-2xl border border-[#F6A9D2]/30">
            <div className="flex justify-between items-center mb-2 font-bold text-xs uppercase text-[#E887B7]">
              <span className="flex items-center gap-1.5"><Sliders className="w-4 h-4" /> Camera Sensitivity</span>
              <span>{settings.sensitivity.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.4"
              max="2.5"
              step="0.1"
              value={settings.sensitivity}
              onChange={(e) => handleSensitivityChange(parseFloat(e.target.value))}
              className="w-full accent-[#E887B7] cursor-pointer"
            />
          </div>

          {/* Reduced Motion */}
          <div className="bg-white/60 p-3.5 rounded-2xl border border-[#F6A9D2]/30 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4 text-[#E887B7]" />
              <span className="font-bold text-xs uppercase text-[#49354F]">Reduced Motion</span>
            </div>
            <button
              onClick={handleReducedMotionToggle}
              className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-1 ${
                settings.reducedMotion ? 'bg-[#E887B7]' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${
                  settings.reducedMotion ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Reset Progress Section */}
          <div className="pt-2">
            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full py-2.5 rounded-2xl border border-red-300 text-red-500 hover:bg-red-50 font-bold text-xs flex items-center justify-center space-x-1.5 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Save Data & Progress</span>
              </button>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-center space-y-2">
                <p className="text-xs font-bold text-red-600">Are you sure? This erases collected stars & checkpoints.</p>
                <div className="flex space-x-2">
                  <button
                    onClick={handleResetProgress}
                    className="flex-1 py-1.5 rounded-xl bg-red-500 text-white font-bold text-xs hover:bg-red-600 shadow-sm"
                  >
                    Confirm Reset
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 py-1.5 rounded-xl bg-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Done Button */}
        <button
          onClick={onBack}
          className="w-full mt-6 dream-button py-3 text-sm flex items-center justify-center space-x-2 shadow-md"
        >
          <Check className="w-4 h-4" />
          <span>Save & Back</span>
        </button>
      </div>
    </div>
  );
};
