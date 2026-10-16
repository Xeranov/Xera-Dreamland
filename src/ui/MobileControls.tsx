import React, { useRef, useState, useEffect } from 'react';
import { GameState } from '../game/systems/GameState';
import { AudioManager } from '../game/systems/AudioManager';
import { ArrowUp, Zap } from 'lucide-react';

export const MobileControls: React.FC = () => {
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchIdRef = useRef<number | null>(null);
  const baseCenterRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Camera swipe tracking
  const cameraTouchIdRef = useRef<number | null>(null);
  const lastCameraPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    // Detect touch capability or mobile screen
    const checkTouch = () => {
      const hasTouch =
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.innerWidth <= 1024;
      setIsTouchDevice(hasTouch);
    };

    checkTouch();
    window.addEventListener('resize', checkTouch);
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  // Joystick Touch Handlers
  const handleJoystickStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (touchIdRef.current !== null) return;

    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;

    if (joystickBaseRef.current) {
      const rect = joystickBaseRef.current.getBoundingClientRect();
      baseCenterRef.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
      updateJoystick(touch.clientX, touch.clientY);
    }
  };

  const handleJoystickMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        updateJoystick(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const updateJoystick = (clientX: number, clientY: number) => {
    const maxRadius = 45; // Max pixel deflection
    const dx = clientX - baseCenterRef.current.x;
    const dy = clientY - baseCenterRef.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    let clampedX = dx;
    let clampedY = dy;

    if (dist > maxRadius) {
      clampedX = (dx / dist) * maxRadius;
      clampedY = (dy / dist) * maxRadius;
    }

    setKnobPos({ x: clampedX, y: clampedY });

    // Normalize to [-1, 1], with Y inverted so moving finger up produces forward vector
    const normX = clampedX / maxRadius;
    const normY = -clampedY / maxRadius;

    GameState.touch.joystickVector = { x: normX, y: normY };
  };

  const handleJoystickEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchIdRef.current) {
        touchIdRef.current = null;
        setKnobPos({ x: 0, y: 0 });
        GameState.touch.joystickVector = { x: 0, y: 0 };
        break;
      }
    }
  };

  // Camera Swipe Surface Handlers (Right side of screen)
  const handleCameraTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (cameraTouchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    cameraTouchIdRef.current = touch.identifier;
    lastCameraPosRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleCameraTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === cameraTouchIdRef.current) {
        const dx = touch.clientX - lastCameraPosRef.current.x;
        const dy = touch.clientY - lastCameraPosRef.current.y;
        lastCameraPosRef.current = { x: touch.clientX, y: touch.clientY };

        GameState.touch.cameraDelta.x += dx * 1.4;
        GameState.touch.cameraDelta.y += dy * 1.4;
        break;
      }
    }
  };

  const handleCameraTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === cameraTouchIdRef.current) {
        cameraTouchIdRef.current = null;
        break;
      }
    }
  };

  if (!isTouchDevice) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-20 select-none overflow-hidden">
      {/* Right-half Camera Drag Surface */}
      <div
        className="absolute right-0 top-16 bottom-32 w-1/2 pointer-events-auto"
        onTouchStart={handleCameraTouchStart}
        onTouchMove={handleCameraTouchMove}
        onTouchEnd={handleCameraTouchEnd}
        onTouchCancel={handleCameraTouchEnd}
      />

      {/* Virtual Joystick (Bottom Left) */}
      <div className="absolute bottom-6 left-6 pointer-events-auto">
        <div
          ref={joystickBaseRef}
          onTouchStart={handleJoystickStart}
          onTouchMove={handleJoystickMove}
          onTouchEnd={handleJoystickEnd}
          onTouchCancel={handleJoystickEnd}
          className="relative w-32 h-32 rounded-full dream-glass flex items-center justify-center border-2 border-[#F6A9D2]/70 shadow-lg touch-none"
        >
          {/* Subtle Directional Marks */}
          <div className="absolute top-2 w-1.5 h-1.5 rounded-full bg-[#E887B7]/50" />
          <div className="absolute bottom-2 w-1.5 h-1.5 rounded-full bg-[#E887B7]/50" />
          <div className="absolute left-2 w-1.5 h-1.5 rounded-full bg-[#E887B7]/50" />
          <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-[#E887B7]/50" />

          {/* Joystick Thumb Knob */}
          <div
            style={{
              transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
              transition: touchIdRef.current === null ? 'transform 0.15s ease-out' : 'none',
            }}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#F6A9D2] to-[#FFF4F8] shadow-md flex items-center justify-center border-2 border-white pointer-events-none"
          >
            <div className="w-5 h-5 rounded-full bg-white/70" />
          </div>
        </div>
      </div>

      {/* Action Buttons (Bottom Right) */}
      <div className="absolute bottom-6 right-6 pointer-events-auto flex items-end space-x-3">
        {/* Meow Button */}
        <button
          onTouchStart={(e) => {
            e.stopPropagation();
            AudioManager.playMeow();
          }}
          className="w-14 h-14 rounded-full dream-glass border-2 border-[#F6A9D2] flex flex-col items-center justify-center text-[#49354F] active:scale-90 transition-transform shadow-lg"
          aria-label="Meow"
        >
          <span className="text-xl">🐾</span>
          <span className="text-[9px] font-bold">Meow</span>
        </button>

        {/* Dash Button */}
        <button
          onTouchStart={(e) => {
            e.stopPropagation();
            GameState.touch.dashPressed = true;
          }}
          onTouchEnd={(e) => {
            e.stopPropagation();
            GameState.touch.dashPressed = false;
          }}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#C9B8FF] to-[#FFF4F8] border-2 border-white flex flex-col items-center justify-center text-[#49354F] active:scale-90 transition-transform shadow-lg"
          aria-label="Dash"
        >
          <Zap className="w-5 h-5 fill-current text-[#765AB8]" />
          <span className="text-[9px] font-bold text-[#765AB8]">Dash</span>
        </button>

        {/* Big Jump Button */}
        <button
          onTouchStart={(e) => {
            e.stopPropagation();
            GameState.touch.jumpPressed = true;
          }}
          onTouchEnd={(e) => {
            e.stopPropagation();
            GameState.touch.jumpPressed = false;
          }}
          className="w-20 h-20 rounded-full dream-button flex flex-col items-center justify-center active:scale-90 transition-transform shadow-xl"
          aria-label="Jump"
        >
          <ArrowUp className="w-7 h-7 stroke-[3]" />
          <span className="text-[11px] font-extrabold uppercase">Jump</span>
        </button>
      </div>
    </div>
  );
};
