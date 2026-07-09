import { drawWaveFrame, type WaveFrameConfig } from '../lib/waveMath';

/**
 * Fully self-contained config for an embedded wave animation. Everything the
 * runtime needs to reproduce a wave is here — no dependency on the app, no
 * network, no external libraries. Colors may be 8-digit hex (#rrggbbaa); a
 * translucent / alpha:0 `backgroundColor` lets the host element show through.
 */
export interface EmbedConfig extends WaveFrameConfig {
  period: number;
  cachedPeriodVariations: number[];
  backgroundColor: string;
}

export interface EmbedHandle {
  destroy(): void;
}

interface EmbedContainer extends HTMLElement {
  __waveEmbed?: EmbedHandle;
}

// When a snippet is exported, the build step replaces this placeholder string
// with the wave's actual config (serialized), so the emitted code can call
// `mount(el)` with no arguments — the values are baked in. The live app always
// passes an explicit config, so this branch is never taken in-app.
const BAKED_CONFIG = '__WAVE_CONFIG_PLACEHOLDER__';

/**
 * Mount an animated wave into `container`, sized to fill it. Returns a handle
 * whose `destroy()` tears everything down. Safe to call multiple times on the
 * same element (the previous instance is destroyed first) and multiple times on
 * one page (each instance owns its own state).
 *
 * `config` is optional: an exported snippet omits it and uses the baked-in
 * values instead.
 */
export function mount(container: HTMLElement, config?: EmbedConfig): EmbedHandle {
  const cfg: EmbedConfig = config ?? (JSON.parse(BAKED_CONFIG) as EmbedConfig);
  const host = container as EmbedContainer;

  // Replace any previous instance mounted on this element.
  if (host.__waveEmbed) host.__waveEmbed.destroy();

  const canvas = document.createElement('canvas');
  canvas.style.display = 'block';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  host.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    host.removeChild(canvas);
    return { destroy() {} };
  }

  let cssWidth = 0;
  let cssHeight = 0;
  let offset = 0;
  const periodPhases: number[] = [];
  let rafId: number | null = null;
  let visible = true;

  const motionQuery =
    typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : null;
  const prefersReducedMotion = () => !!motionQuery && motionQuery.matches;

  function resize(): void {
    const w = host.clientWidth;
    const h = host.clientHeight;
    // Skip collapsed / hidden containers; the ResizeObserver will re-fire once
    // the element gains a size.
    if (w === 0 || h === 0) return;
    cssWidth = w;
    cssHeight = h;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    // Draw in logical (CSS) pixels; the backing store is scaled for crispness.
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function paint(): void {
    if (cssWidth === 0 || cssHeight === 0) return;
    ctx!.clearRect(0, 0, cssWidth, cssHeight);
    ctx!.fillStyle = cfg.backgroundColor;
    ctx!.fillRect(0, 0, cssWidth, cssHeight);
    drawWaveFrame(ctx!, cssWidth, cssHeight, cfg, offset, periodPhases);
  }

  function step(): void {
    offset += cfg.period;
    for (let i = 0; i < cfg.waveCount; i++) {
      periodPhases[i] = (periodPhases[i] ?? 0) + (cfg.cachedPeriodVariations[i] ?? 0);
    }
    paint();
  }

  function loop(): void {
    step();
    rafId = requestAnimationFrame(loop);
  }

  function startLoop(): void {
    if (rafId !== null || !visible || prefersReducedMotion()) return;
    rafId = requestAnimationFrame(loop);
  }

  function stopLoop(): void {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  const resizeObserver = new ResizeObserver(() => {
    resize();
    // Repaint so a paused (offscreen / reduced-motion) instance stays correct.
    paint();
  });
  resizeObserver.observe(host);

  const intersectionObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) visible = entry.isIntersecting;
    if (visible) startLoop();
    else stopLoop();
  });
  intersectionObserver.observe(host);

  const onMotionChange = () => {
    if (prefersReducedMotion()) {
      stopLoop();
      paint(); // settle on a single static frame
    } else {
      startLoop();
    }
  };
  if (motionQuery) {
    if (typeof motionQuery.addEventListener === 'function') {
      motionQuery.addEventListener('change', onMotionChange);
    } else if (typeof motionQuery.addListener === 'function') {
      // Safari < 14
      motionQuery.addListener(onMotionChange);
    }
  }

  // Initial sizing + first frame, then start animating (unless reduced motion).
  resize();
  paint();
  startLoop();

  const handle: EmbedHandle = {
    destroy() {
      stopLoop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      if (motionQuery) {
        if (typeof motionQuery.removeEventListener === 'function') {
          motionQuery.removeEventListener('change', onMotionChange);
        } else if (typeof motionQuery.removeListener === 'function') {
          motionQuery.removeListener(onMotionChange);
        }
      }
      if (canvas.parentNode === host) host.removeChild(canvas);
      if (host.__waveEmbed === handle) delete host.__waveEmbed;
    }
  };

  host.__waveEmbed = handle;
  return handle;
}
