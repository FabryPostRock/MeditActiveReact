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
  // Start from the time when the mouse moves and ends after 'duration' time has been reached.
  age: number;
  duration: number;
  intensity: number;
}

const MIN_EMISSION_DISTANCE = 14;
const MAX_WAVES = 32;
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

    /**
     * creates a MediaQueryList object that verifies if the device satifies the parameters conditions
     * pointer: fine  defines a precise pointer
     * prefers-reduced-motion: no-preference  the user has not requested animations reduction
     */
    const effectPreference = window.matchMedia(
      '(min-width: 1200px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
    );

    let waves: WakeWave[] = [];
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
     * Draw one expanding pair of curved wake segments. Its stored movement
     * direction determines where the wake trails, while its age controls the
     * spread, distance, line width, and gradual loss of opacity.
     *       
         x →
         y ↓

        P ●  (leftRearX, leftRearY)
           ╲
            ╲     ramo sinistro della scia
             ╲
        C × · · ╲
          punto   ╲
          di       ● S  (leftTipX, leftTipY)
          controllo│
                   │ tipGap
                   └──────── ● T  (tipX, tipY)
                              │
                              │ tipDynamicOffsetFromOrigin
                              │
                              ● O  (wave.x, wave.y)
                              ↓
                       movimento del mouse
       
     */
    function drawWave(wave: WakeWave) {
      if (!context) return;
      // From 0 (wave created) to 1 (wave ended)
      const timeProgressRatio = Math.min(wave.age / wave.duration, 1);
      // From 1 to 0 with exponent 1.6
      const remainingOpacity = Math.pow(1 - timeProgressRatio, 1.6);
      // From 1 (wave created) to 0 (wave ended)
      const opacity = wave.intensity * remainingOpacity;
      // Distance from the mouse origin point. The tips gradually move away from the point where the wave originated.
      // Starting line point close to mouse point
      const tipDynamicOffsetFromOrigin = 8 + timeProgressRatio * 24;
      // Ending line point coordinate far from mouse point > Starting point
      const rearDynamicOffsetFromOrigin = 24 + timeProgressRatio * 105;
      // avoid contact between the ending points
      const rearGapExpansion = Math.pow(1.4 * timeProgressRatio, 1.6);
      const rearGap = 25 + 25 * rearGapExpansion;
      // avoid contact between the starting points
      const tipGapExpansion = Math.pow(2 * timeProgressRatio, 1.6);
      const tipGap = 3 + 6 * tipGapExpansion;
      // It is used to determine the curvature produced by quadraticCurveTo().
      const controlDynamicOffsetFromOrigin =
        tipDynamicOffsetFromOrigin + (rearDynamicOffsetFromOrigin - tipDynamicOffsetFromOrigin) * 0.58;

      const tipX = wave.x - wave.directionX * tipDynamicOffsetFromOrigin;
      const tipY = wave.y - wave.directionY * tipDynamicOffsetFromOrigin;
      // First starting line point coordinates
      /** 
       * To calculate the line points, two rotations of 90° are implemented (one for the left line wave and one for the right line wave) 
       * with respect to mouse direction.
       * (tipX, tipY) Are the origin point coordinates from where the algorithm starts to determine the first and second starting
        point in the two perpendicular directions:

                   ● S  (leftTipX, leftTipY) ● S  (rightTipX, rightTipY)
                   │                         |
                   │ tipGap                  |
                   └──────── ● T  (tipX, tipY)
                              │
                              │ tipDynamicOffsetFromOrigin
                              │
                              ● O  (wave.x, wave.y)
                              ↓
                       mouse moving

          -> x incrementing
          ↓ y incrementing
      */
      const leftTipX = tipX - wave.directionY * tipGap;
      const leftTipY = tipY + wave.directionX * tipGap;
      // second starting line point coordinates
      const rightTipX = tipX + wave.directionY * tipGap;
      const rightTipY = tipY - wave.directionX * tipGap;
      // first ending line point coordinates
      const rearCenterX = wave.x - wave.directionX * rearDynamicOffsetFromOrigin;
      const rearCenterY = wave.y - wave.directionY * rearDynamicOffsetFromOrigin;
      const leftRearX = rearCenterX - wave.directionY * rearGap * 2;
      const leftRearY = rearCenterY + wave.directionX * rearGap;
      // second ending line point coordinates
      const rightRearX = rearCenterX + wave.directionY * rearGap * 2;
      const rightRearY = rearCenterY - wave.directionX * rearGap;
      const leftControlX = wave.x - wave.directionX * controlDynamicOffsetFromOrigin - wave.directionY * rearGap * 0.36;
      const leftControlY = wave.y - wave.directionY * controlDynamicOffsetFromOrigin + wave.directionX * rearGap * 0.36;
      const rightControlX =
        wave.x - wave.directionX * controlDynamicOffsetFromOrigin + wave.directionY * rearGap * 0.36;
      const rightControlY =
        wave.y - wave.directionY * controlDynamicOffsetFromOrigin - wave.directionX * rearGap * 0.36;
      console.log(`wave.directionX ${wave.directionX} - wave.directionY ${wave.directionY}`);
      console.log(`leftTipX ${leftTipX} - leftTipY ${leftTipY} - leftRearX ${leftRearX} - leftRearY ${leftRearY}`);
      /*
      /*
       * Create a horizontal color transition across the left and right lines. Color-stop
       * positions are normalized: 0 is the start, 0.5 the center, and 1 the end.
       */
      const wakeGradient = context.createLinearGradient(leftRearX, leftRearY, rightRearX, rightRearY);
      // Keep the outer end of the left branch softly transparent.
      wakeGradient.addColorStop(0, `rgba(235, 164, 22, ${opacity * 0.15})`);
      // Use the wave's full current opacity at the center of the gradient.
      wakeGradient.addColorStop(0.5, `rgba(235, 164, 22, ${opacity})`);
      // Fade the outer end of the right branch symmetrically with the left one.
      wakeGradient.addColorStop(1, `rgba(235, 164, 22, ${opacity * 0.15})`);

      // Preserve the current drawing state so temporary wake styles do not affect later canvas drawings.
      context.save();
      // Start a new path to prevent this wave from connecting to paths drawn in a previous frame.
      context.beginPath();
      // Draw the left branch from its separated tip to its outer endpoint through a curved control point.
      context.moveTo(leftTipX, leftTipY);
      context.quadraticCurveTo(leftControlX, leftControlY, leftRearX, leftRearY);
      // Move without drawing, then construct the right branch as an independent curved segment.
      context.moveTo(rightTipX, rightTipY);
      context.quadraticCurveTo(rightControlX, rightControlY, rightRearX, rightRearY);
      // Apply the orange gradient to both branches stored in the current path.
      context.strokeStyle = wakeGradient;
      // Make the stroke gradually thinner as the wave expands and approaches the end of its lifetime.
      context.lineWidth = 1.8 - timeProgressRatio * 0.55;
      // Add a subtle orange glow whose visibility fades together with the wave.
      context.shadowColor = `rgba(235, 164, 22, ${opacity * 0.55})`;
      context.shadowBlur = 6;
      // Render both curved branches with the configured stroke and shadow settings.
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

      waves.forEach((wave) => {
        wave.age += elapsedTime;
        drawWave(wave);
      });

      waves = waves.filter((wave) => wave.age < wave.duration);

      if (waves.length) {
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

      if (distance < MIN_EMISSION_DISTANCE) return;

      const elapsedTime = Math.max(currentPosition.timestamp - lastPointerPosition.timestamp, 1);
      const speed = Math.min(distance / elapsedTime, 2);
      const directionX = movementX / distance;
      const directionY = movementY / distance;

      waves.push({
        x: currentPosition.x,
        y: currentPosition.y,
        directionX,
        directionY,
        age: 0,
        duration: 2850 + Math.random() * 150, //------------------------------------------------------MEGLIO METTERE UN VALORE FISSO?
        intensity: 1,
      });

      const perpendicularX = -directionY;
      const perpendicularY = directionX;

      waves = waves.slice(-MAX_WAVES);
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
      waves = [];
      clearCanvas();
    }

    /**
     * React to live changes in viewport size, pointer capabilities, or reduced-
     * motion preference by enabling or disabling the complete effect rather
     * than leaving an invisible animation running in the background.
     */
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

    /*
     * Undo every side effect created above when React unmounts the component.
     * This cleanup is also safe when React replays effects during development.
     */
    return () => {
      effectPreference.removeEventListener('change', handlePreferenceChange);
      deactivateEffect();
    };
  }, []);

  return <canvas ref={canvasRef} className="cursor-wake" aria-hidden="true" />;
}
