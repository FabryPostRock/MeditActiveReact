import { useEffect, useRef } from 'react';

interface PointerPosition {
  x: number;
  y: number;
  timestamp: number;
}

interface FoamRipple {
  x: number;
  y: number;
  directionX: number;
  directionY: number;
  // Start from the time when the mouse moves and ends after 'duration' time has been reached.
  age: number;
  duration: number;
  opacity: number;
}

const MAX_FOAM_RIPPLES = 15;
const MIN_EMISSION_DISTANCE = 35;
const MAX_PIXEL_RATIO = 2;

/**
 * Renders the decorative canvas used to create a short, boat-like wake behind
 * the mouse. The component keeps the animation isolated from the Home content
 * so React does not need to re-render whenever a wave changes.
 */
export function CursorWake() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /*
   * Set up the canvas, pointer listeners, media-query listener, and animation
   * lifecycle after React has attached the canvas element to its ref.
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    // get through the DOM Tree from the canvas to the first parent
    const homePage = canvas?.closest<HTMLElement>('.home-page');
    /* request to canvas its 2d environment. context returns commands use to draw:
      - beginPath() starts new trace
      - moveTo() establish starting point
      - quadraticCurveTo() draw curve waves
      - arc() render the circular ripples
      - stroke() shows the previous traces
      - clearRect() deletes the last trace

    */
    const context = canvas?.getContext('2d');

    if (!canvas || !homePage || !context) return;
    const colorSecondaryRgb = getComputedStyle(document.documentElement).getPropertyValue('--bs-secondary-rgb').trim();
    /**
     * creates a MediaQueryList object that verifies if the device satifies the parameters conditions
     * pointer: fine  defines a precise pointer
     * prefers-reduced-motion: no-preference  the user has not requested animations reduction
     */
    const effectPreference = window.matchMedia(
      '(min-width: 1200px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
    );

    let foamRipples: FoamRipple[] = [];
    let lastPointerPosition: PointerPosition | null = null;
    let animationFrameId: number | null = null;
    let previousFrameTimestamp = 0;
    let viewportWidth = 0;
    let viewportHeight = 0;
    let isActive = false;

    /**
     * Match the canvas bitmap to the current viewport and device pixel ratio.
     * Capping the ratio keeps the result sharp on high-density displays without
     * allocating an unnecessarily large drawing buffer.
     */
    function resizeCanvas() {
      if (!context || !canvas) return;
      // for retina screen window.devicePixelRatio can reach 2 and it contains 2 times the pixels
      // in the same view area.
      const pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
      viewportWidth = window.innerWidth;
      viewportHeight = window.innerHeight;
      // doubles the pixels view and maintains the same coordinates.
      canvas.width = Math.round(viewportWidth * pixelRatio);
      canvas.height = Math.round(viewportHeight * pixelRatio);
      /**
       * Scale logical canvas coordinates to physical device pixels for sharp 
       * rendering without changing CSS dimensions.
       * setTransform(scalaX, inclinazioneY, inclinazioneX, scalaY, spostamentoX,
          spostamentoY
        )
       */
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      // rounds the drawn junctions
      context.lineCap = 'round';
      context.lineJoin = 'round';
    }

    /**
     * Remove the previous frame before drawing the updated waves. Canvas keeps
     * every rendered pixel until it is explicitly cleared, unlike regular DOM
     * elements whose appearance is recalculated automatically.
     */
    function clearCanvas() {
      context?.clearRect(0, 0, viewportWidth, viewportHeight);
    }

    /**
     * Draw one small circular ripple in the disturbed water behind the main
     * wake. These lighter details break up the paired curves and make the
     * result feel less geometrically uniform.
     */
    function drawFoamRipple(ripple: FoamRipple) {
      if (!context) return;
      // From 0 (circle created) to 1 (circle ended)
      const timeProgressRatio = Math.min(ripple.age / ripple.duration, 1);
      // From 1 to 0 with exponent 1.6
      const negExpFactor = Math.pow(1 - timeProgressRatio, 1.6);
      // From 1 (wave created) to 0 (wave ended)
      const opacity = ripple.opacity * negExpFactor;
      const radius = 6 + negExpFactor * 14;

      // Preserve the current drawing state so temporary wake styles do not affect later canvas drawings.
      context.save();
      context.beginPath();
      // The first two parameters are the x and y coordinates of the circle origin
      context.arc(ripple.x, ripple.y, radius, 0, Math.PI * 2);
      context.strokeStyle = `rgba(${colorSecondaryRgb}, ${opacity})`;
      // Add a subtle orange glow whose visibility fades together with the wave.
      context.shadowColor = `rgba(${colorSecondaryRgb}, ${opacity * 0.6})`;
      context.shadowBlur = 6;
      context.lineWidth = 1.2;
      // draw rendering
      context.stroke();
      // Restore the drawing state that was active before this individual wave was styled.
      context.restore();
    }

    /**
     * Advance and render every active wave for the current animation frame.
     * Expired items are removed, and the requestAnimationFrame loop stops when
     * nothing remains to draw so an idle page does not perform needless work.
     */
    function animate(timestamp: number) {
      const elapsedTime = previousFrameTimestamp ? Math.min(timestamp - previousFrameTimestamp, 40) : 0;
      previousFrameTimestamp = timestamp;

      clearCanvas();

      foamRipples.forEach((ripple) => {
        ripple.age += elapsedTime;
        drawFoamRipple(ripple);
      });

      foamRipples = foamRipples.filter((ripple) => ripple.age < ripple.duration);

      if (foamRipples.length) {
        animationFrameId = window.requestAnimationFrame(animate);
        return;
      }

      animationFrameId = null;
      previousFrameTimestamp = 0;
    }

    /**
     * Start the requestAnimationFrame loop only when it is not already running.
     * Pointer events can arrive very quickly, so this guard prevents multiple
     * animation loops from updating and drawing the same arrays concurrently.
     */
    function startAnimation() {
      if (animationFrameId !== null) return;
      animationFrameId = window.requestAnimationFrame(animate);
    }

    /**
     * Convert mouse movement into new wake data. Movement distance controls
     * emission frequency, while the vector between pointer samples provides
     * the direction and speed used to orient and intensify the wake.
     */
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

      // MIN_EMISSION_DISTANCE : establishes when the next mouse movement is sufficient to trigger the next draw
      if (distance < MIN_EMISSION_DISTANCE) return;

      const elapsedTime = Math.max(currentPosition.timestamp - lastPointerPosition.timestamp, 1);
      const speed = Math.min(distance / elapsedTime, 2);
      const directionX = movementX / distance;
      const directionY = movementY / distance;
      const speedX = directionX * speed;
      const speedY = directionY * speed;

      for (let index = 0; index < 2; index += 1) {
        foamRipples.push({
          x: currentPosition.x,
          y: currentPosition.y,
          directionX: directionX,
          directionY: directionY,
          age: 0,
          duration: 1520 + Math.random() * 220,
          opacity: 1,
        });
      }

      foamRipples = foamRipples.slice(-MAX_FOAM_RIPPLES);
      lastPointerPosition = currentPosition;
      startAnimation();
    }

    /**
     * Forget the previous sample when the pointer leaves the Home area. This
     * prevents a long artificial wave from being created between the old exit
     * position and the next position where the pointer re-enters the page.
     */
    function resetPointerPosition() {
      lastPointerPosition = null;
    }

    /**
     * Prepare and enable the effect when the device satisfies the interaction
     * and motion requirements. Event listeners are registered only while the
     * effect can actually be displayed.
     */
    function activateEffect() {
      if (isActive || !homePage) return;
      isActive = true;
      resizeCanvas();
      homePage.addEventListener('pointermove', handlePointerMove);
      homePage.addEventListener('pointerleave', resetPointerPosition);
      window.addEventListener('resize', resizeCanvas);
    }

    /**
     * Stop the effect and release all of its resources. Removing listeners,
     * cancelling the pending frame, and clearing particle data avoids work and
     * stale drawings after a media-query change or component unmount.
     */
    function deactivateEffect() {
      if (!isActive || !homePage) return;
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
      foamRipples = [];
      clearCanvas();
    }

    /**
     * React to live changes in viewport size, pointer capabilities, or reduced-
     * motion preference by enabling or disabling the complete effect rather
     * than leaving an invisible animation running in the background.
     */
    function handlePreferenceChange(event: MediaQueryListEvent) {
      // true only if all window.matchMedia(..conditions) are true
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

    /*
     * Undo every side effect created above when React unmounts the component.
     * This cleanup is also safe when React replays effects during development.
     */
    return () => {
      effectPreference.removeEventListener('change', handlePreferenceChange);
      deactivateEffect();
    };
    // []:Every time CursorWake is mounted because it installs one time and one time only the animation.
    // Using nothing instead of '[]' will mount the animation every time before every rendering.
    // Moreover React only renders the empty canvas. The true animation is managed by Canvas 2D API.
  }, []);

  return <canvas ref={canvasRef} className="cursor-wake" aria-hidden="true" />;
}
