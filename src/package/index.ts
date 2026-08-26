import {
  AMPLITUDE_RANGE,
  CURVATURE_RANGE,
  DEFAULT_AMPLITUDE,
  DEFAULT_BACKGROUND_COLOR,
  DEFAULT_CURVATURE,
  DEFAULT_FREQUENCY,
  DEFAULT_GLITCH,
  DEFAULT_PERIOD,
  DEFAULT_ROTATION,
  DEFAULT_SPACING,
  DEFAULT_TAPER,
  DEFAULT_THICKNESS,
  DEFAULT_WAVELENGTH,
  DEFAULT_WAVE_COLOR,
  DEFAULT_WAVE_COUNT,
  FREQUENCY_RANGE,
  PERIOD_RANGE,
  ROTATION_RANGE,
  SPACING_JITTER_MAX_FRACTION,
  THICKNESS_RANGE,
  WAVELENGTH_RANGE,
  WAVE_COUNT_RANGE
} from '../lib/constants';
import {
  applyGlitchToCanvas,
  clamp,
  drawWaveFrame,
  generateCachedVariations,
  type WaveFrameConfig
} from '../lib/waveMath';

export interface WaveVariations {
  amplitude: number;
  wavelength: number;
  frequency: number;
  period: number;
  rotation: number;
  curvature: number;
  spacing: number;
  thickness: number;
}

export interface WaveConfig {
  seed: number;
  amplitude: number;
  wavelength: number;
  frequency: number;
  period: number;
  rotation: number;
  curvature: number;
  glitch: number;
  spacing: number;
  thickness: number;
  taper: number;
  waveCount: number;
  waveColor: string;
  backgroundColor: string;
  vertexStep: number;
  variations: WaveVariations;
}

export type WaveConfigInput = Partial<Omit<WaveConfig, 'variations'>> & {
  variations?: Partial<WaveVariations>;
};

export type WaveConfigString = `waves:v1:${string}`;
export type WaveConfigSource = WaveConfigInput | string;

export interface WaveHandle {
  update(config: WaveConfigSource): void;
  destroy(): void;
}

const DEFAULT_VARIATIONS: WaveVariations = Object.freeze({
  amplitude: 0,
  wavelength: 0,
  frequency: 0,
  period: 0,
  rotation: 0,
  curvature: 0,
  spacing: 0,
  thickness: 0
});

export const DEFAULT_WAVE_CONFIG: WaveConfig = Object.freeze({
  seed: 0,
  amplitude: DEFAULT_AMPLITUDE,
  wavelength: DEFAULT_WAVELENGTH,
  frequency: DEFAULT_FREQUENCY,
  period: DEFAULT_PERIOD,
  rotation: DEFAULT_ROTATION,
  curvature: DEFAULT_CURVATURE,
  glitch: DEFAULT_GLITCH,
  spacing: DEFAULT_SPACING,
  thickness: DEFAULT_THICKNESS,
  taper: DEFAULT_TAPER,
  waveCount: DEFAULT_WAVE_COUNT,
  waveColor: DEFAULT_WAVE_COLOR,
  backgroundColor: DEFAULT_BACKGROUND_COLOR,
  vertexStep: 5,
  variations: DEFAULT_VARIATIONS
});

const CONFIG_PREFIX = 'waves:v1:';

const NUMBER_ALIASES = [
  ['s', 'seed'],
  ['a', 'amplitude'],
  ['w', 'wavelength'],
  ['f', 'frequency'],
  ['p', 'period'],
  ['r', 'rotation'],
  ['c', 'curvature'],
  ['g', 'glitch'],
  ['sp', 'spacing'],
  ['th', 'thickness'],
  ['tp', 'taper'],
  ['n', 'waveCount'],
  ['vs', 'vertexStep']
] as const;

const STRING_ALIASES = [
  ['wc', 'waveColor'],
  ['bg', 'backgroundColor']
] as const;

const VARIATION_ALIASES = [
  ['a', 'amplitude'],
  ['w', 'wavelength'],
  ['f', 'frequency'],
  ['p', 'period'],
  ['r', 'rotation'],
  ['c', 'curvature'],
  ['sp', 'spacing'],
  ['th', 'thickness']
] as const;

const CONFIG_ALIASES = new Set([
  ...NUMBER_ALIASES.map(([alias]) => alias),
  ...STRING_ALIASES.map(([alias]) => alias),
  'v'
]);
const VARIATION_ALIAS_SET = new Set<string>(
  VARIATION_ALIASES.map(([alias]) => alias)
);

const mountedWaves = new WeakMap<HTMLElement, WaveHandle>();

function finiteOr(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function colorOr(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function variationOr(value: unknown, fallback: number): number {
  return clamp(finiteOr(value, fallback), 0, 1);
}

/** Creates a complete, JSON-safe and deterministic wave configuration. */
export function createWaveConfig(overrides: WaveConfigInput = {}): WaveConfig {
  const sourceVariations = overrides.variations ?? {};
  const variations = {} as WaveVariations;

  for (const key of Object.keys(DEFAULT_VARIATIONS) as Array<keyof WaveVariations>) {
    variations[key] = variationOr(sourceVariations[key], DEFAULT_VARIATIONS[key]);
  }

  return {
    seed: finiteOr(overrides.seed, DEFAULT_WAVE_CONFIG.seed),
    amplitude: finiteOr(overrides.amplitude, DEFAULT_WAVE_CONFIG.amplitude),
    wavelength: finiteOr(overrides.wavelength, DEFAULT_WAVE_CONFIG.wavelength),
    frequency: finiteOr(overrides.frequency, DEFAULT_WAVE_CONFIG.frequency),
    period: finiteOr(overrides.period, DEFAULT_WAVE_CONFIG.period),
    rotation: finiteOr(overrides.rotation, DEFAULT_WAVE_CONFIG.rotation),
    curvature: finiteOr(overrides.curvature, DEFAULT_WAVE_CONFIG.curvature),
    glitch: finiteOr(overrides.glitch, DEFAULT_WAVE_CONFIG.glitch),
    spacing: finiteOr(overrides.spacing, DEFAULT_WAVE_CONFIG.spacing),
    thickness: finiteOr(overrides.thickness, DEFAULT_WAVE_CONFIG.thickness),
    taper: finiteOr(overrides.taper, DEFAULT_WAVE_CONFIG.taper),
    waveCount: clamp(
      Math.round(finiteOr(overrides.waveCount, DEFAULT_WAVE_CONFIG.waveCount)),
      WAVE_COUNT_RANGE.min,
      WAVE_COUNT_RANGE.max
    ),
    waveColor: colorOr(overrides.waveColor, DEFAULT_WAVE_CONFIG.waveColor),
    backgroundColor: colorOr(
      overrides.backgroundColor,
      DEFAULT_WAVE_CONFIG.backgroundColor
    ),
    vertexStep: clamp(
      finiteOr(overrides.vertexStep, DEFAULT_WAVE_CONFIG.vertexStep),
      1,
      50
    ),
    variations
  };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function hasOwn(value: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function requireFiniteNumber(value: unknown, alias: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError(`Wave config alias "${alias}" must be a finite number`);
  }
  return value;
}

function requireNonEmptyString(value: unknown, alias: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new TypeError(`Wave config alias "${alias}" must be a non-empty string`);
  }
  return value;
}

/** Encodes a normalized configuration as a canonical, portable v1 string. */
export function encodeWaveConfig(
  config: WaveConfigInput = {}
): WaveConfigString {
  const normalized = createWaveConfig(config);
  const payload: Record<string, unknown> = {};

  for (const [alias, field] of NUMBER_ALIASES) {
    if (alias === 'vs') continue;
    if (normalized[field] !== DEFAULT_WAVE_CONFIG[field]) {
      payload[alias] = normalized[field];
    }
  }
  for (const [alias, field] of STRING_ALIASES) {
    if (normalized[field] !== DEFAULT_WAVE_CONFIG[field]) {
      payload[alias] = normalized[field];
    }
  }
  if (normalized.vertexStep !== DEFAULT_WAVE_CONFIG.vertexStep) {
    payload.vs = normalized.vertexStep;
  }

  const variations: Record<string, number> = {};
  for (const [alias, field] of VARIATION_ALIASES) {
    if (normalized.variations[field] !== DEFAULT_VARIATIONS[field]) {
      variations[alias] = normalized.variations[field];
    }
  }
  if (Object.keys(variations).length > 0) payload.v = variations;

  return `${CONFIG_PREFIX}${JSON.stringify(payload)}` as WaveConfigString;
}

/** Validates and decodes a portable v1 string into a complete configuration. */
export function decodeWaveConfig(value: string): WaveConfig {
  if (typeof value !== 'string') {
    throw new TypeError('Wave config must be a string');
  }

  const trimmed = value.trim();
  if (!trimmed.startsWith(CONFIG_PREFIX)) {
    throw new TypeError('Wave config has an invalid or unsupported prefix');
  }

  let payload: unknown;
  try {
    payload = JSON.parse(trimmed.slice(CONFIG_PREFIX.length));
  } catch {
    throw new TypeError('Wave config payload must be valid JSON');
  }
  if (!isPlainObject(payload)) {
    throw new TypeError('Wave config payload must be a plain object');
  }

  for (const alias of Object.keys(payload)) {
    if (!CONFIG_ALIASES.has(alias)) {
      throw new TypeError(`Unknown wave config alias "${alias}"`);
    }
  }

  const expanded: WaveConfigInput = {};
  for (const [alias, field] of NUMBER_ALIASES) {
    if (hasOwn(payload, alias)) {
      expanded[field] = requireFiniteNumber(payload[alias], alias);
    }
  }
  for (const [alias, field] of STRING_ALIASES) {
    if (hasOwn(payload, alias)) {
      expanded[field] = requireNonEmptyString(payload[alias], alias);
    }
  }

  if (hasOwn(payload, 'v')) {
    const encodedVariations = payload.v;
    if (!isPlainObject(encodedVariations)) {
      throw new TypeError('Wave config alias "v" must be a plain object');
    }
    for (const alias of Object.keys(encodedVariations)) {
      if (!VARIATION_ALIAS_SET.has(alias)) {
        throw new TypeError(`Unknown wave variation alias "${alias}"`);
      }
    }

    const variations: Partial<WaveVariations> = {};
    for (const [alias, field] of VARIATION_ALIASES) {
      if (hasOwn(encodedVariations, alias)) {
        variations[field] = requireFiniteNumber(
          encodedVariations[alias],
          `v.${alias}`
        );
      }
    }
    expanded.variations = variations;
  }

  return createWaveConfig(expanded);
}

function normalizeWaveConfigSource(
  source: WaveConfigSource | undefined,
  currentConfig?: WaveConfig
): WaveConfig {
  if (typeof source === 'string') return decodeWaveConfig(source);
  const input = source ?? {};
  if (!currentConfig) return createWaveConfig(input);

  return createWaveConfig({
    ...currentConfig,
    ...input,
    variations: {
      ...currentConfig.variations,
      ...input.variations
    }
  });
}

interface ResolvedWaveConfig {
  frame: WaveFrameConfig;
  period: number;
  periodVariations: number[];
  backgroundColor: string;
  glitch: number;
}

function resolveWaveConfig(config: WaveConfig): ResolvedWaveConfig {
  const { waveCount, seed, variations } = config;
  const amplitudeVariations = generateCachedVariations(
    waveCount,
    variations.amplitude,
    AMPLITUDE_RANGE.min,
    AMPLITUDE_RANGE.max,
    seed - 1000
  );

  return {
    frame: {
      amplitudes: amplitudeVariations.map((value) => config.amplitude + value),
      waveCount,
      wavelength: config.wavelength,
      frequency: config.frequency,
      rotation: config.rotation,
      curvature: config.curvature,
      glitch: config.glitch,
      spacing: config.spacing,
      thickness: config.thickness,
      taper: config.taper,
      waveColor: config.waveColor,
      cachedWavelengthVariations: generateCachedVariations(
        waveCount,
        variations.wavelength,
        WAVELENGTH_RANGE.min,
        WAVELENGTH_RANGE.max,
        seed
      ),
      cachedFrequencyVariations: generateCachedVariations(
        waveCount,
        variations.frequency,
        FREQUENCY_RANGE.min,
        FREQUENCY_RANGE.max,
        seed + 1000
      ),
      cachedRotationVariations: generateCachedVariations(
        waveCount,
        variations.rotation,
        ROTATION_RANGE.min,
        ROTATION_RANGE.max,
        seed + 3000
      ),
      cachedCurvatureVariations: generateCachedVariations(
        waveCount,
        variations.curvature,
        CURVATURE_RANGE.min,
        CURVATURE_RANGE.max,
        seed + 4000
      ),
      cachedSpacingVariations: generateCachedVariations(
        waveCount,
        variations.spacing,
        -SPACING_JITTER_MAX_FRACTION,
        SPACING_JITTER_MAX_FRACTION,
        seed + 5000
      ),
      cachedThicknessVariations: generateCachedVariations(
        waveCount,
        variations.thickness,
        THICKNESS_RANGE.min,
        THICKNESS_RANGE.max,
        seed + 6000
      ),
      vertexStep: config.vertexStep
    },
    period: config.period,
    periodVariations: generateCachedVariations(
      waveCount,
      variations.period,
      PERIOD_RANGE.min,
      PERIOD_RANGE.max,
      seed + 2000
    ),
    backgroundColor: config.backgroundColor,
    glitch: config.glitch
  };
}

/**
 * Mounts an animated wave that fills `container`. Calling it again for the same
 * element first destroys the prior instance.
 */
export function mountWave(
  container: HTMLElement,
  config: WaveConfigSource = {}
): WaveHandle {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    throw new Error('mountWave() requires a browser DOM');
  }
  if (!(container instanceof HTMLElement)) {
    throw new TypeError('mountWave() requires an HTMLElement container');
  }

  const initialConfig = normalizeWaveConfigSource(config);
  mountedWaves.get(container)?.destroy();

  const canvas = document.createElement('canvas');
  const glitchCanvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.display = 'block';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  container.appendChild(canvas);

  const renderingContext = canvas.getContext('2d');
  if (!renderingContext) {
    container.removeChild(canvas);
    throw new Error('mountWave() could not create a 2D canvas context');
  }
  const ctx: CanvasRenderingContext2D = renderingContext;

  let currentConfig = initialConfig;
  let resolved = resolveWaveConfig(currentConfig);
  let cssWidth = 0;
  let cssHeight = 0;
  let offset = 0;
  let periodPhases: number[] = [];
  let rafId: number | null = null;
  let visible = true;
  let destroyed = false;

  const motionQuery = typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;
  const prefersReducedMotion = () => Boolean(motionQuery?.matches);

  function resize(): void {
    if (destroyed) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (width <= 0 || height <= 0) return;

    cssWidth = width;
    cssHeight = height;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function paint(): void {
    if (destroyed || cssWidth <= 0 || cssHeight <= 0) return;
    ctx.clearRect(0, 0, cssWidth, cssHeight);
    ctx.fillStyle = resolved.backgroundColor;
    ctx.fillRect(0, 0, cssWidth, cssHeight);
    drawWaveFrame(ctx, cssWidth, cssHeight, resolved.frame, offset, periodPhases);
    applyGlitchToCanvas(
      ctx,
      cssWidth,
      cssHeight,
      resolved.glitch,
      offset,
      glitchCanvas
    );
  }

  function step(): void {
    offset += resolved.period;
    for (let i = 0; i < resolved.frame.waveCount; i++) {
      periodPhases[i] =
        (periodPhases[i] ?? 0) + (resolved.periodVariations[i] ?? 0);
    }
    paint();
  }

  function loop(): void {
    if (destroyed) return;
    step();
    rafId = window.requestAnimationFrame(loop);
  }

  function startLoop(): void {
    if (destroyed || rafId !== null || !visible || prefersReducedMotion()) return;
    rafId = window.requestAnimationFrame(loop);
  }

  function stopLoop(): void {
    if (rafId === null) return;
    window.cancelAnimationFrame(rafId);
    rafId = null;
  }

  const onResize = () => {
    resize();
    paint();
  };
  const resizeObserver = typeof ResizeObserver === 'function'
    ? new ResizeObserver(onResize)
    : null;
  if (resizeObserver) resizeObserver.observe(container);
  else window.addEventListener('resize', onResize);

  const intersectionObserver = typeof IntersectionObserver === 'function'
    ? new IntersectionObserver((entries) => {
        visible = entries.some((entry) => entry.isIntersecting);
        if (visible) startLoop();
        else stopLoop();
      })
    : null;
  intersectionObserver?.observe(container);

  const onMotionChange = () => {
    if (prefersReducedMotion()) {
      stopLoop();
      paint();
    } else {
      startLoop();
    }
  };
  if (typeof motionQuery?.addEventListener === 'function') {
    motionQuery.addEventListener('change', onMotionChange);
  } else if (typeof motionQuery?.addListener === 'function') {
    motionQuery.addListener(onMotionChange);
  }

  const handle: WaveHandle = {
    update(nextConfig) {
      if (destroyed) return;
      const next = normalizeWaveConfigSource(nextConfig, currentConfig);
      const nextResolved = resolveWaveConfig(next);
      currentConfig = next;
      resolved = nextResolved;
      offset = 0;
      periodPhases = [];
      resize();
      paint();
      startLoop();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      stopLoop();
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      if (!resizeObserver) window.removeEventListener('resize', onResize);
      if (typeof motionQuery?.removeEventListener === 'function') {
        motionQuery.removeEventListener('change', onMotionChange);
      } else if (typeof motionQuery?.removeListener === 'function') {
        motionQuery.removeListener(onMotionChange);
      }
      if (canvas.parentNode === container) container.removeChild(canvas);
      if (mountedWaves.get(container) === handle) mountedWaves.delete(container);
    }
  };

  mountedWaves.set(container, handle);
  resize();
  paint();
  startLoop();
  return handle;
}
