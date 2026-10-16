import React, { useState, useEffect } from 'react';
import { GameCanvas } from './GameCanvas';
import { HUD } from '../ui/HUD';
import { MainMenu } from '../ui/MainMenu';
import { PauseMenu } from '../ui/PauseMenu';
import { InventoryPanel } from '../ui/InventoryPanel';
import { MobileControls } from '../ui/MobileControls';
import { GameState, GameScreen } from '../game/systems/GameState';

export const App: React.FC = () => {
  const [screen, setScreen] = useState<GameScreen>('menu');
  const [isInventoryOpen, setIsInventoryOpen] = useState<boolean>(false);

  useEffect(() => {
    return GameState.subscribe((state) => {
      setScreen(state.screen);
      setIsInventoryOpen(state.isInventoryOpen);
    });
  }, []);

  return (
    <main className="w-full h-full relative overflow-hidden bg-[#FFF4F8] font-sans">
      {/* 3D Scene Layer */}
      <GameCanvas isPaused={screen === 'paused'} />

      {/* Screen Overlays */}
      {screen === 'menu' && (
        <MainMenu onStart={() => GameState.setScreen('playing')} />
      )}

      {screen === 'playing' && (
        <>
          <HUD onOpenPause={() => GameState.setScreen('paused')} />
          {!isInventoryOpen && <MobileControls />}
          {isInventoryOpen && <InventoryPanel />}
        </>
      )}

      {screen === 'paused' && (
        <>
          <HUD onOpenPause={() => {}} />
          <PauseMenu
            onResume={() => GameState.setScreen('playing')}
            onGoHome={() => GameState.setScreen('menu')}
          />
        </>
      )}
    </main>
  );
};
export default App;
