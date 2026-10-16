import { useEffect, useRef } from 'react';
import { GameState } from '../game/systems/GameState';
import { AudioManager } from '../game/systems/AudioManager';

export interface GameInput {
  moveX: number; // -1 (left) to 1 (right)
  moveZ: number; // -1 (backward) to 1 (forward)
  jump: boolean;
  dash: boolean;
  interact: boolean;
  meow: boolean;
  cameraDeltaX: number;
  cameraDeltaY: number;
  cameraZoomDelta: number;
}

export function useGameInput() {
  const keysDown = useRef<Record<string, boolean>>({});
  const cameraDelta = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const zoomDelta = useRef<number>(0);
  const isMouseDown = useRef<boolean>(false);
  const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture keys if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const code = e.code;
      keysDown.current[code] = true;

      if (code === 'Escape') {
        const currentScreen = GameState.getState().screen;
        if (currentScreen === 'playing') {
          GameState.setScreen('paused');
        } else if (currentScreen === 'paused') {
          GameState.setScreen('playing');
        }
      }

      if (code === 'KeyM') {
        AudioManager.playMeow();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysDown.current[e.code] = false;
    };

    const handleBlur = () => {
      keysDown.current = {};
      isMouseDown.current = false;
    };

    const handleMouseDown = (e: MouseEvent) => {
      // Right button or left drag outside UI elements
      if (e.button === 0 || e.button === 2) {
        // Only if clicking on canvas or game area
        if ((e.target as HTMLElement)?.tagName === 'CANVAS') {
          isMouseDown.current = true;
          lastMousePos.current = { x: e.clientX, y: e.clientY };
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDown.current) return;
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      lastMousePos.current = { x: e.clientX, y: e.clientY };

      cameraDelta.current.x += dx;
      cameraDelta.current.y += dy;
    };

    const handleMouseUp = () => {
      isMouseDown.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'CANVAS') {
        zoomDelta.current += e.deltaY * 0.005;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const getInput = (): GameInput => {
    const keys = keysDown.current;

    // Desktop Keyboard
    let kbMoveX = 0;
    let kbMoveZ = 0;

    if (keys['KeyW'] || keys['ArrowUp']) kbMoveZ += 1;
    if (keys['KeyS'] || keys['ArrowDown']) kbMoveZ -= 1;
    if (keys['KeyA'] || keys['ArrowLeft']) kbMoveX -= 1;
    if (keys['KeyD'] || keys['ArrowRight']) kbMoveX += 1;

    // Mobile Joystick
    const touchJoy = GameState.touch.joystickVector;
    const finalMoveX = kbMoveX !== 0 ? kbMoveX : touchJoy.x;
    const finalMoveZ = kbMoveZ !== 0 ? kbMoveZ : touchJoy.y;

    // Normalize combined input vector if length > 1
    const len = Math.sqrt(finalMoveX * finalMoveX + finalMoveZ * finalMoveZ);
    const normX = len > 1 ? finalMoveX / len : finalMoveX;
    const normZ = len > 1 ? finalMoveZ / len : finalMoveZ;

    const jump = Boolean(keys['Space'] || GameState.touch.jumpPressed);
    const dash = Boolean(keys['ShiftLeft'] || keys['ShiftRight'] || GameState.touch.dashPressed);
    const interact = Boolean(keys['KeyE'] || GameState.touch.interactPressed);
    const meow = Boolean(keys['KeyM'] || GameState.touch.meowPressed);

    // Consume camera delta
    const deltaX = cameraDelta.current.x + GameState.touch.cameraDelta.x;
    const deltaY = cameraDelta.current.y + GameState.touch.cameraDelta.y;
    cameraDelta.current.x = 0;
    cameraDelta.current.y = 0;
    GameState.touch.cameraDelta.x = 0;
    GameState.touch.cameraDelta.y = 0;

    const zoom = zoomDelta.current;
    zoomDelta.current = 0;

    return {
      moveX: normX,
      moveZ: normZ,
      jump,
      dash,
      interact,
      meow,
      cameraDeltaX: deltaX,
      cameraDeltaY: deltaY,
      cameraZoomDelta: zoom,
    };
  };

  return { getInput };
}
