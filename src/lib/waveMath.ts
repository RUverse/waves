import {
  BASE_SPACING,
  CANVAS_SETTINGS,
  TAPER_RANGE,
  THICKNESS_RANGE,
  INPUT_RANGE_FACTOR
} from './constants';

export interface Point {
  x: number;
  y: number;
}

const TAPER_PROFILE_CYCLES = 2;
const MIN_TAPER_MULTIPLIER = 0.15;

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function rotatePoint(
  x: number,
  y: number,
  centerX: number,
  centerY: number,
  rotationCos: number,
  rotationSin: number
): Point {
  const dx = x - centerX;
  const dy = y - centerY;
  return {
    x: centerX + dx * rotationCos - dy * rotationSin,
    y: centerY + dx * rotationSin + dy * rotationCos
  };
}

export function getTaperAmount(taper: number): number {
  // Upper bound extended to match the pro-mode text input, so a manually
  // entered taper beyond the slider range is honored.
  return clamp(taper, TAPER_RANGE.min, TAPER_RANGE.max * INPUT_RANGE_FACTOR);
}

// Clamp a thickness to the render range. Upper bound extended to match the
// pro-mode text input so manually entered thicknesses beyond the slider render.
export function clampThickness(value: number): number {
  return clamp(value, THICKNESS_RANGE.min, THICKNESS_RANGE.max * INPUT_RANGE_FACTOR);
}

export function getTaperMultiplier(t: number, taper: number, phase: number): number {
  const amount = getTaperAmount(taper);
  if (amount <= 0) return 1;

  const profile = Math.sin(t * Math.PI * 2 * TAPER_PROFILE_CYCLES + phase);
  return Math.max(MIN_TAPER_MULTIPLIER, 1 + amount * profile);
}

export function getMaxTaperMultiplier(taper: number): number {
  return 1 + getTaperAmount(taper);
}

export function createVariableWidthWavePoints(
  x: number,
  yStart: number,
  yEnd: number,
  vertexStep: number,
  amplitude: number,
  wavelength: number,
  offset: number,
  frequency: number,
  thickness: number,
  taper: number,
  phase: number,
  centerX: number,
  centerY: number,
  rotationCos: number,
  rotationSin: number
): { left: Point[]; right: Point[] } {
  const left: Point[] = [];
  const right: Point[] = [];
  const span = yEnd - yStart || 1;
  let lastY = yStart;

  const addPoint = (y: number) => {
    const angle = y * wavelength + offset + frequency;
    const waveX = x + Math.sin(angle) * amplitude;
    const dxDy = Math.cos(angle) * amplitude * wavelength;
    const normalLength = Math.hypot(1, dxDy);
    const normalX = 1 / normalLength;
    const normalY = -dxDy / normalLength;
    const t = clamp((y - yStart) / span, 0, 1);
    const localThickness = thickness * getTaperMultiplier(t, taper, phase);
    const halfThickness = Math.max(localThickness / 2, 0.05);

    left.push(rotatePoint(
      waveX + normalX * halfThickness,
      y + normalY * halfThickness,
      centerX,
      centerY,
      rotationCos,
      rotationSin
    ));
    right.push(rotatePoint(
      waveX - normalX * halfThickness,
      y - normalY * halfThickness,
      centerX,
      centerY,
      rotationCos,
      rotationSin
    ));
    lastY = y;
  };

  for (let y = yStart; y <= yEnd; y += vertexStep) {
    addPoint(y);
  }

  if (lastY < yEnd) {
    addPoint(yEnd);
  }

  return { left, right };
}

export function drawVariableWidthWaveCanvas(
  ctx: CanvasRenderingContext2D,
  x: number,
  yStart: number,
  yEnd: number,
  vertexStep: number,
  amplitude: number,
  wavelength: number,
  offset: number,
  frequency: number,
  thickness: number,
  taper: number,
  phase: number,
  centerX: number,
  centerY: number,
  rotationCos: number,
  rotationSin: number
): void {
  const { left, right } = createVariableWidthWavePoints(
    x,
    yStart,
    yEnd,
    vertexStep,
    amplitude,
    wavelength,
    offset,
    frequency,
    thickness,
    taper,
    phase,
    centerX,
    centerY,
    rotationCos,
    rotationSin
  );

  if (left.length === 0 || right.length === 0) return;

  ctx.beginPath();
  ctx.moveTo(left[0].x, left[0].y);
  for (let i = 1; i < left.length; i++) {
    ctx.lineTo(left[i].x, left[i].y);
  }
  for (let i = right.length - 1; i >= 0; i--) {
    ctx.lineTo(right[i].x, right[i].y);
  }
  ctx.closePath();
  ctx.fill();
}

/**
 * Simple seeded pseudo-random number generator for consistent wave variation
 */
export function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Generate cached variations for all waves for a given attribute
 * These variations are fixed per wave index and don't change until variation strength changes
 */
export function generateCachedVariations(
  count: number,
  variationStrength: number,
  min: number,
  max: number,
  seedOffset: number = 0
): number[] {
  const variations: number[] = [];

  if (variationStrength <= 0) {
    // If no variation, return array of zeros
    for (let i = 0; i < count; i++) {
      variations[i] = 0;
    }
    return variations;
  }

  const range = max - min;
  const variationRange = range * variationStrength;

  for (let i = 0; i < count; i++) {
    // Generate a seeded random value between -1 and 1
    const randomValue = seededRandom(i + seedOffset) * 2 - 1;
    // Scale to variation range
    variations[i] = randomValue * (variationRange / 2);
  }
  return variations;
}

/**
 * Config for a single native-size wave frame. Colors are any valid CSS color
 * string (including 8-digit hex #rrggbbaa for translucency).
 */
export interface WaveFrameConfig {
  amplitudes: number[];
  waveCount: number;
  wavelength: number;
  frequency: number;
  rotation: number;
  spacing: number;
  thickness: number;
  taper: number;
  waveColor: string;
  cachedWavelengthVariations: number[];
  cachedFrequencyVariations: number[];
  cachedRotationVariations: number[];
  cachedSpacingVariations: number[];
  cachedThicknessVariations: number[];
  vertexStep?: number;
}

/**
 * Draws ONLY the waves (no background) into `ctx` at native scale (1:1) — the
 * shared renderer used by the embed runtime and any 1:1 render. This mirrors the
 * inner loop of `renderWaveToCanvas` with the export scaling folded out, so the
 * embed looks identical to the live sketch at the container's own size.
 *
 * The caller owns animation: it advances `offset` and accumulates per-wave
 * `periodPhases` between frames, exactly as the live p5 sketch does.
 */
export function drawWaveFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  cfg: WaveFrameConfig,
  offset: number,
  periodPhases: number[]
): void {
  const {
    amplitudes,
    waveCount,
    wavelength,
    frequency,
    rotation,
    spacing,
    thickness,
    taper,
    waveColor,
    cachedWavelengthVariations,
    cachedFrequencyVariations,
    cachedRotationVariations,
    cachedSpacingVariations,
    cachedThicknessVariations,
    vertexStep = CANVAS_SETTINGS.vertexStep
  } = cfg;

  ctx.strokeStyle = waveColor;
  ctx.fillStyle = waveColor;

  // Gap is an absolute pixel value (BASE_SPACING * spacing), viewport-independent.
  const adjustedSpacing = BASE_SPACING * spacing;

  const centerX = width / 2;
  const centerY = height / 2;

  // Draw each wave much taller than the canvas so it spans any rotation without
  // an edge cutout (mirrors createWaveSketch / renderWaveToCanvas).
  const maxAmplitude = amplitudes.reduce(
    (max, a) => Math.max(max, Math.abs(a ?? 0)),
    0
  );
  const taperAmount = getTaperAmount(taper);
  const maxThickness = waveCount > 0
    ? Math.max(
        ...Array.from({ length: waveCount }, (_, idx) =>
          clampThickness(thickness + (cachedThicknessVariations[idx] ?? 0)) *
          getMaxTaperMultiplier(taperAmount)
        )
      )
    : THICKNESS_RANGE.min;
  const coverRadius =
    Math.hypot(width, height) / 2 + maxAmplitude + maxThickness;

  for (let i = 0; i < waveCount; i++) {
    const idx = i;
    const amplitude = amplitudes[idx] ?? 0;
    const waveWavelength = wavelength + (cachedWavelengthVariations[idx] ?? 0);
    const waveFrequency = frequency + (cachedFrequencyVariations[idx] ?? 0);
    const waveRotation = rotation + (cachedRotationVariations[idx] ?? 0);
    const waveThickness = clampThickness(
      thickness + (cachedThicknessVariations[idx] ?? 0)
    );
    const rotationRadians = waveRotation * Math.PI / 180;
    const rotationCos = Math.cos(rotationRadians);
    const rotationSin = Math.sin(rotationRadians);

    const spacingJitter = (cachedSpacingVariations[idx] ?? 0) * adjustedSpacing;
    const x = centerX + (i - (waveCount - 1) / 2) * adjustedSpacing + spacingJitter;

    // Shared base scroll plus this wave's accumulated period-variation drift.
    const wavePhase = offset + (periodPhases[idx] ?? 0);

    if (taperAmount > 0) {
      drawVariableWidthWaveCanvas(
        ctx,
        x,
        centerY - coverRadius,
        centerY + coverRadius,
        vertexStep,
        amplitude,
        waveWavelength,
        wavePhase,
        waveFrequency,
        waveThickness,
        taperAmount,
        idx * 0.85,
        centerX,
        centerY,
        rotationCos,
        rotationSin
      );
    } else {
      ctx.lineWidth = waveThickness;
      ctx.beginPath();
      let first = true;
      for (let y = centerY - coverRadius; y <= centerY + coverRadius; y += vertexStep) {
        const waveX = x + Math.sin(y * waveWavelength + wavePhase + waveFrequency) * amplitude;
        const rotatedPoint = rotatePoint(waveX, y, centerX, centerY, rotationCos, rotationSin);
        if (first) {
          ctx.moveTo(rotatedPoint.x, rotatedPoint.y);
          first = false;
        } else {
          ctx.lineTo(rotatedPoint.x, rotatedPoint.y);
        }
      }
      ctx.stroke();
    }
  }
}
