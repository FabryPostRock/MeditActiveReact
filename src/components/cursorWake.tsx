import { useEffect, useRef } from 'react';

interface PointerPosition {
  x: number;
  y: number;
  timestamp: number;
}

interface WakeWave {
  x: number;
  y: number;
  directionX: number;
  directionY: number;
  age: number;
  duration: number;
  intensity: number;
}

interface FoamRipple {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  age: number;
  duration: number;
}

const MIN_EMISSION_DISTANCE = 14;
const MAX_WAVES = 32;
const MAX_FOAM_RIPPLES = 48;
const MAX_PIXEL_RATIO = 2;

export function CursorWake() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const homePage = canvas?.closest<HTMLElement>('.home-page');
    const context = canvas?.getContext('2d');

    if (!canvas || !homePage || !context) return;

    const effectPreference = window.matchMedia(
      '(min-width: 1200px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
    );

    let waves: WakeWave[] = [];
    let foamRipples: FoamRipple[] = [];
    let lastPointerPosition: PointerPosition | null = null;
    let animationFrameId: number | null = null;
    let previousFrameTimestamp = 0;
    let viewportWidth = 0;
    let viewportHeight = 0;
    let isActive = false;

    function resizeCanvas() {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
      viewportWidth = window.innerWidth;
      viewportHeight = window.innerHeight;
      canvas.width = Math.round(viewportWidth * pixelRatio);
      canvas.height = Math.round(viewportHeight * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.lineCap = 'round';
      context.lineJoin = 'round';
    }

    function clearCanvas() {
      context.clearRect(0, 0, viewportWidth, viewportHeight);
    }

    function drawWave(wave: WakeWave) {
      const progress = Math.min(wave.age / wave.duration, 1);
      const remainingOpacity = Math.pow(1 - progress, 1.6);
      const opacity = wave.intensity * remainingOpacity;
      const perpendicularX = -wave.directionY;
      const perpendicularY = wave.directionX;
      const tipDistance = 8 + progress * 24;
      const rearDistance = 24 + progress * 105;
      const spread = 7 + progress * 62;
      const tipGap = 4 + progress * 2;
      const controlDistance = tipDistance + (rearDistance - tipDistance) * 0.58;

      const tipX = wave.x - wave.directionX * tipDistance;
      const tipY = wave.y - wave.directionY * tipDistance;
      const leftTipX = tipX + perpendicularX * tipGap;
      const leftTipY = tipY + perpendicularY * tipGap;
      const rightTipX = tipX - perpendicularX * tipGap;
      const rightTipY = tipY - perpendicularY * tipGap;
      const rearCenterX = wave.x - wave.directionX * rearDistance;
      const rearCenterY = wave.y - wave.directionY * rearDistance;
      const leftX = rearCenterX + perpendicularX * spread;
      const leftY = rearCenterY + perpendicularY * spread;
      const rightX = rearCenterX - perpendicularX * spread;
      const rightY = rearCenterY - perpendicularY * spread;
      const leftControlX = wave.x - wave.directionX * controlDistance + perpendicularX * spread * 0.36;
      const leftControlY = wave.y - wave.directionY * controlDistance + perpendicularY * spread * 0.36;
      const rightControlX = wave.x - wave.directionX * controlDistance - perpendicularX * spread * 0.36;
      const rightControlY = wave.y - wave.directionY * controlDistance - perpendicularY * spread * 0.36;

      const wakeGradient = context.createLinearGradient(leftX, leftY, rightX, rightY);
      wakeGradient.addColorStop(0, `rgba(235, 164, 22, ${opacity * 0.45})`);
      wakeGradient.addColorStop(0.5, `rgba(235, 164, 22, ${opacity})`);
      wakeGradient.addColorStop(1, `rgba(235, 164, 22, ${opacity * 0.45})`);

      context.save();
      context.beginPath();
      context.moveTo(leftTipX, leftTipY);
      context.quadraticCurveTo(leftControlX, leftControlY, leftX, leftY);
      context.moveTo(rightTipX, rightTipY);
      context.quadraticCurveTo(rightControlX, rightControlY, rightX, rightY);
      context.strokeStyle = wakeGradient;
      context.lineWidth = 1.8 - progress * 0.55;
      context.shadowColor = `rgba(235, 164, 22, ${opacity * 0.55})`;
      context.shadowBlur = 6;
      context.stroke();
      context.restore();
    }

    function drawFoamRipple(ripple: FoamRipple) {
      const progress = Math.min(ripple.age / ripple.duration, 1);
      const opacity = 0.2 * Math.pow(1 - progress, 1.8);
      const radius = 1.5 + progress * 8;

      context.beginPath();
      context.arc(ripple.x, ripple.y, radius, 0, Math.PI * 2);
      context.strokeStyle = `rgba(235, 164, 22, ${opacity})`;
      context.lineWidth = 0.8;
      context.stroke();
    }

    function animate(timestamp: number) {
      const elapsedTime = previousFrameTimestamp ? Math.min(timestamp - previousFrameTimestamp, 40) : 0;
      previousFrameTimestamp = timestamp;

      clearCanvas();

      waves.forEach((wave) => {
        wave.age += elapsedTime;
        drawWave(wave);
      });

      foamRipples.forEach((ripple) => {
        ripple.age += elapsedTime;
        ripple.x += ripple.velocityX * elapsedTime;
        ripple.y += ripple.velocityY * elapsedTime;
        drawFoamRipple(ripple);
      });

      waves = waves.filter((wave) => wave.age < wave.duration);
      foamRipples = foamRipples.filter((ripple) => ripple.age < ripple.duration);

      if (waves.length || foamRipples.length) {
        animationFrameId = window.requestAnimationFrame(animate);
        return;
      }

      animationFrameId = null;
      previousFrameTimestamp = 0;
    }

    function startAnimation() {
      if (animationFrameId !== null) return;
      animationFrameId = window.requestAnimationFrame(animate);
    }

    function handlePointerMove(event: PointerEvent) {
      if (event.pointerType !== 'mouse') return;

      const currentPosition: PointerPosition = {
        x: event.clientX,
        y: event.clientY,
        timestamp: event.timeStamp,
      };

      if (!lastPointerPosition) {
        lastPointerPosition = currentPosition;
        return;
      }

      const movementX = currentPosition.x - lastPointerPosition.x;
      const movementY = currentPosition.y - lastPointerPosition.y;
      const distance = Math.hypot(movementX, movementY);

      if (distance < MIN_EMISSION_DISTANCE) return;

      const elapsedTime = Math.max(currentPosition.timestamp - lastPointerPosition.timestamp, 1);
      const speed = Math.min(distance / elapsedTime, 2);
      const directionX = movementX / distance;
      const directionY = movementY / distance;
      const intensity = Math.min(0.34, 0.16 + speed * 0.1);

      waves.push({
        x: currentPosition.x,
        y: currentPosition.y,
        directionX,
        directionY,
        age: 0,
        duration: 850 + Math.random() * 150,
        intensity,
      });

      const perpendicularX = -directionY;
      const perpendicularY = directionX;

      for (let index = 0; index < 2; index += 1) {
        const lateralOffset = (Math.random() - 0.5) * 10;
        const backwardSpeed = 0.014 + Math.random() * 0.012;
        const lateralSpeed = (Math.random() - 0.5) * 0.014;

        foamRipples.push({
          x: currentPosition.x - directionX * 10 + perpendicularX * lateralOffset,
          y: currentPosition.y - directionY * 10 + perpendicularY * lateralOffset,
          velocityX: -directionX * backwardSpeed + perpendicularX * lateralSpeed,
          velocityY: -directionY * backwardSpeed + perpendicularY * lateralSpeed,
          age: 0,
          duration: 520 + Math.random() * 220,
        });
      }

      waves = waves.slice(-MAX_WAVES);
      foamRipples = foamRipples.slice(-MAX_FOAM_RIPPLES);
      lastPointerPosition = currentPosition;
      startAnimation();
    }

    function resetPointerPosition() {
      lastPointerPosition = null;
    }

    function activateEffect() {
      if (isActive) return;
      isActive = true;
      resizeCanvas();
      homePage.addEventListener('pointermove', handlePointerMove);
      homePage.addEventListener('pointerleave', resetPointerPosition);
      window.addEventListener('resize', resizeCanvas);
    }

    function deactivateEffect() {
      if (!isActive) return;
      isActive = false;
      homePage.removeEventListener('pointermove', handlePointerMove);
      homePage.removeEventListener('pointerleave', resetPointerPosition);
      window.removeEventListener('resize', resizeCanvas);

      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }

      animationFrameId = null;
      previousFrameTimestamp = 0;
      lastPointerPosition = null;
      waves = [];
      foamRipples = [];
      clearCanvas();
    }

    function handlePreferenceChange(event: MediaQueryListEvent) {
      if (event.matches) {
        activateEffect();
        return;
      }

      deactivateEffect();
    }

    effectPreference.addEventListener('change', handlePreferenceChange);

    if (effectPreference.matches) {
      activateEffect();
    }

    return () => {
      effectPreference.removeEventListener('change', handlePreferenceChange);
      deactivateEffect();
    };
  }, []);

  return <canvas ref={canvasRef} className="cursor-wake" aria-hidden="true" />;
}
