import React, { useState, useEffect } from 'react';
import { SaveManager } from '../game/systems/SaveManager';
import { GameState } from '../game/systems/GameState';
import { X, Sparkles, Bell, Crown, Lock, Check } from 'lucide-react';

interface AccessoryItem {
  id: string;
  name: string;
  icon: string;
  slot: string;
  description: string;
  unlockCondition: string;
  isUnlocked: (bellCount: number, shrineDone: boolean, unlockedList: string[]) => boolean;
}

const ACCESSORIES: AccessoryItem[] = [
  {
    id: 'flower_pin',
    name: 'Sakura Flower Pin',
    icon: '🌸',
    slot: 'Left Ear',
    description: 'A delicate blossoming sakura blossom picked from the great meadow tree.',
    unlockCondition: 'Find 3 Hidden Bells',
    isUnlocked: (bellCount, _shrineDone, list) => bellCount >= 3 || list.includes('flower_pin'),
  },
  {
    id: 'ribbon_bow',
    name: 'Pink Satin Ribbon Bow',
    icon: '🎀',
    slot: 'Collar & Bell',
    description: 'A silky handcrafted pink bow tie that flutters with every joyful leap.',
    unlockCondition: 'Find 6 Hidden Bells',
    isUnlocked: (bellCount, _shrineDone, list) => bellCount >= 6 || list.includes('ribbon_bow'),
  },
  {
    id: 'starlight_crown',
    name: 'Golden Starlight Crown',
    icon: '👑',
    slot: 'Crown of Ears',
    description: 'A majestic radiant crown blessed by the celestial constellation beacons.',
    unlockCondition: 'Restore the Starlight Shrine',
    isUnlocked: (_bellCount, shrineDone, list) => shrineDone || list.includes('starlight_crown'),
  },
];

export const InventoryPanel: React.FC = () => {
  const [saveData, setSaveData] = useState(SaveManager.getData());

  useEffect(() => {
    return SaveManager.subscribe((data) => {
      setSaveData({ ...data });
    });
  }, []);

  const handleClose = () => {
    GameState.setInventoryOpen(false);
  };

  const handleEquip = (id: string) => {
    SaveManager.equipAccessory(id);
    GameState.showBanner(`Equipped ${ACCESSORIES.find((a) => a.id === id)?.name}! ✨`, 2000);
  };

  const handleUnequip = () => {
    SaveManager.equipAccessory(null);
    GameState.showBanner('Accessory unequipped 🐾', 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in pointer-events-auto">
      <div className="w-full max-w-lg dream-glass rounded-3xl p-6 md:p-8 shadow-2xl border-2 border-[#F6A9D2]/70 relative flex flex-col space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F6A9D2]/40">
          <div className="flex items-center space-x-2.5">
            <span className="text-2xl">🎒</span>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-[#49354F]">Dreamland Journal</h2>
              <p className="text-xs text-[#8C7A92] font-semibold">Wardrobe & Exploration Progress</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close Inventory"
            className="w-9 h-9 rounded-full dream-glass flex items-center justify-center text-[#49354F] hover:text-[#E887B7] hover:border-[#E887B7] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Exploration Stats Bar */}
        <div className="grid grid-cols-3 gap-3">
          {/* Star Fragments */}
          <div className="bg-white/60 p-3 rounded-2xl flex flex-col items-center justify-center border border-[#FFDF6D]/60 shadow-sm text-center">
            <div className="w-7 h-7 rounded-full bg-[#FFDF6D] text-[#996B00] flex items-center justify-center mb-1">
              <Sparkles className="w-4 h-4 fill-current" />
            </div>
            <span className="text-[10px] uppercase font-bold text-[#8C7A92] tracking-wider">Stars</span>
            <span className="text-base font-extrabold text-[#49354F]">
              {saveData.collectedStarIds.length} <span className="text-xs text-[#8C7A92]">/ 24</span>
            </span>
          </div>

          {/* Hidden Bells */}
          <div className="bg-white/60 p-3 rounded-2xl flex flex-col items-center justify-center border border-[#FCD34D]/60 shadow-sm text-center">
            <div className="w-7 h-7 rounded-full bg-[#FCD34D] text-[#8C6200] flex items-center justify-center mb-1">
              <Bell className="w-4 h-4 fill-current" />
            </div>
            <span className="text-[10px] uppercase font-bold text-[#8C7A92] tracking-wider">Bells</span>
            <span className="text-base font-extrabold text-[#49354F]">
              {saveData.collectedBellIds.length} <span className="text-xs text-[#8C7A92]">/ 8</span>
            </span>
          </div>

          {/* Starlight Shrine */}
          <div className="bg-white/60 p-3 rounded-2xl flex flex-col items-center justify-center border border-[#C9B8FF]/60 shadow-sm text-center">
            <div className="w-7 h-7 rounded-full bg-[#C9B8FF] text-[#4F3699] flex items-center justify-center mb-1">
              <Crown className="w-4 h-4 fill-current" />
            </div>
            <span className="text-[10px] uppercase font-bold text-[#8C7A92] tracking-wider">Shrine</span>
            <span className="text-xs font-bold text-[#49354F] mt-0.5">
              {saveData.shrineCompleted ? 'Restored ✨' : 'Locked 🗝️'}
            </span>
          </div>
        </div>

        {/* Wardrobe Accessories Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[#49354F] uppercase tracking-wider">
              Cosmetic Accessories
            </h3>
            {saveData.equippedAccessory && (
              <button
                onClick={handleUnequip}
                className="text-xs font-bold text-[#E887B7] hover:underline"
              >
                Unequip Current
              </button>
            )}
          </div>

          <div className="space-y-3">
            {ACCESSORIES.map((item) => {
              const unlocked = item.isUnlocked(
                saveData.collectedBellIds.length,
                saveData.shrineCompleted,
                saveData.unlockedAccessories
              );
              const isEquipped = saveData.equippedAccessory === item.id;

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl transition-all border flex items-center justify-between ${
                    isEquipped
                      ? 'bg-[#FFF0F6] border-[#F6A9D2] shadow-md ring-2 ring-[#F6A9D2]/50'
                      : unlocked
                      ? 'bg-white/60 border-white/80 hover:bg-white/80 shadow-sm'
                      : 'bg-white/30 border-white/40 opacity-70'
                  }`}
                >
                  {/* Left Icon & Info */}
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${
                        unlocked ? 'bg-white' : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {unlocked ? item.icon : <Lock className="w-5 h-5 text-gray-400" />}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-[#49354F]">{item.name}</span>
                        {isEquipped && (
                          <span className="text-[10px] bg-[#F6A9D2] text-white px-2 py-0.5 rounded-full font-bold flex items-center space-x-1">
                            <Check className="w-3 h-3 inline" /> <span>Worn</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#7A6A80] mt-0.5 max-w-xs">{item.description}</p>
                      {!unlocked && (
                        <p className="text-[11px] font-semibold text-[#B3688E] mt-1 flex items-center space-x-1">
                          <Lock className="w-3 h-3 inline mr-1" />
                          <span>Unlock: {item.unlockCondition}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Action Button */}
                  <div>
                    {unlocked ? (
                      isEquipped ? (
                        <button
                          onClick={handleUnequip}
                          className="px-3.5 py-1.5 rounded-full text-xs font-bold border border-[#E887B7] text-[#E887B7] hover:bg-[#E887B7] hover:text-white transition-all shadow-sm"
                        >
                          Take Off
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEquip(item.id)}
                          className="dream-button px-4 py-1.5 text-xs font-bold shadow-sm"
                        >
                          Wear
                        </button>
                      )
                    ) : (
                      <span className="px-3 py-1.5 rounded-full text-xs font-bold text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed">
                        Locked
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer tip */}
        <div className="text-center pt-2">
          <p className="text-xs text-[#8C7A92]">
            Press <kbd className="bg-white/80 px-1.5 py-0.5 rounded shadow-sm text-xs font-bold">I</kbd> or{' '}
            <kbd className="bg-white/80 px-1.5 py-0.5 rounded shadow-sm text-xs font-bold">Esc</kbd> anytime to toggle journal
          </p>
        </div>
      </div>
    </div>
  );
};
