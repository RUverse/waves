import type p5 from 'p5';
import type { WaveAttribute } from './types';
import {
  DEFAULT_AMPLITUDE,
  DEFAULT_WAVE_COUNT,
  DEFAULT_WAVELENGTH,
  DEFAULT_FREQUENCY,
  DEFAULT_PERIOD,
  DEFAULT_ROTATION,
  DEFAULT_CURVATURE,
  DEFAULT_SPACING,
  DEFAULT_THICKNESS,
  DEFAULT_TAPER,
  DEFAULT_WAVE_COLOR,
  DEFAULT_BACKGROUND_COLOR,
  WAVE_GENERATION,
  CANVAS_SETTINGS,
  THICKNESS_RANGE,
  BASE_SPACING
} from './constants';
import {
  rotatePoint,
  getCurvatureOffset,
  getTaperAmount,
  getMaxTaperMultiplier,
  clampThickness,
  createVariableWidthWavePoints,
  drawVariableWidthWaveCanvas
} from './waveMath';

// Re-export the pure variation helpers so existing importers (App.svelte) keep
// importing them from waveLogic while the definitions live in waveMath.
export { generateCachedVariations, seededRandom } from './waveMath';

/**
 * Applies random variation to a value based on variation strength
 * @param baseValue The base value to apply variation to
 * @param variationStrength The strength of variation (0 = no variation, 1 = full range)
 * @param min The minimum allowed value
 * @param max The maximum allowed value
 * @returns A value with random variation applied
 */
export function applyVariation(
  baseValue: number,
  variationStrength: number,
  min: number,
  max: number
): number {
  if (variationStrength <= 0) return baseValue;

  // Create a variation range around the base value
  const range = max - min;
  const variationRange = range * variationStrength;
  const minVariation = Math.max(min, baseValue - variationRange / 2);
  const maxVariation = Math.min(max, baseValue + variationRange / 2);

  return minVariation + Math.random() * (maxVariation - minVariation);
}

/**
 * Generates initial values for waves applying variation to the base value
 * This is a generalized version that can apply variation to any numeric attribute
 * @param baseValue The base/average value
 * @param count The number of waves to generate
 * @param variationStrength The strength of variation to apply (0 to 1)
 * @param min Minimum allowed value
 * @param max Maximum allowed value
 * @returns An array of values with random variation applied
 */
export function generateInitialAmplitudes(
  baseValue: number = DEFAULT_AMPLITUDE,
  count: number = DEFAULT_WAVE_COUNT,
  variationStrength: number = WAVE_GENERATION.amplitudeVariation,
  min: number = -60,
  max: number = 140
): number[] {
  const values: number[] = [];
  
  for (let i = 0; i < count; i++) {
    values[i] = applyVariation(baseValue, variationStrength, min, max);
  }
  return values;
}

/**
 * Reset functions for individual wave parameters
 */
export function resetAmplitude(): number {
  return DEFAULT_AMPLITUDE;
}

export function resetWavelength(): number {
  return DEFAULT_WAVELENGTH;
}

export function resetFrequency(): number {
  return DEFAULT_FREQUENCY;
}

export function resetPeriod(): number {
  return DEFAULT_PERIOD;
}

export function resetRotation(): number {
  return DEFAULT_ROTATION;
}

export function resetCurvature(): number {
  return DEFAULT_CURVATURE;
}

export function resetSpacing(): number {
  return DEFAULT_SPACING;
}

export function resetThickness(): number {
  return DEFAULT_THICKNESS;
}

export function resetTaper(): number {
  return DEFAULT_TAPER;
}

export function resetWaveCount(): number {
  return DEFAULT_WAVE_COUNT;
}

export function resetWaveColor(): string {
  return DEFAULT_WAVE_COLOR;
}

export function resetBackgroundColor(): string {
  return DEFAULT_BACKGROUND_COLOR;
}

function drawVariableWidthWaveP5(
  p: p5,
  x: number,
  yStart: number,
  yEnd: number,
  vertexStep: number,
  amplitude: number,
  wavelength: number,
  offset: number,
  frequency: number,
  curvature: number,
  renderRadius: number,
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
    curvature,
    renderRadius,
    thickness,
    taper,
    phase,
    centerX,
    centerY,
    rotationCos,
    rotationSin
  );

  p.beginShape();
  for (const point of left) {
    p.vertex(point.x, point.y);
  }
  for (let i = right.length - 1; i >= 0; i--) {
    const point = right[i];
    p.vertex(point.x, point.y);
  }
  p.endShape(p.CLOSE);
}

/**
 * Creates a p5 sketch function for rendering waves
 */
export function createWaveSketch(
  getAmplitudes: () => number[],
  getWaveCount: () => number,
  getWavelength: () => number,
  getFrequency: () => number,
  getPeriod: () => number,
  getRotation: () => number,
  getCurvature: () => number,
  getSpacing: () => number,
  getThickness: () => number,
  getTaper: () => number,
  getWaveColor: () => string,
  getBackgroundColor: () => string,
  getOffset: () => number,
  setOffset: (value: number) => void,
  getCachedWavelengthVariations: () => number[] = () => [],
  getCachedFrequencyVariations: () => number[] = () => [],
  getCachedPeriodVariations: () => number[] = () => [],
  getCachedRotationVariations: () => number[] = () => [],
  getCachedCurvatureVariations: () => number[] = () => [],
  getCachedSpacingVariations: () => number[] = () => [],
  getCachedThicknessVariations: () => number[] = () => [],
  setPeriodPhases: (value: number[]) => void = () => {}
) {
  return (p: p5) => {
    // Per-wave accumulated animation phase. Each wave's phase advances by
    // basePeriod plus its own period variation every frame, so waves with
    // period variance drift out of sync over time. Integrated (rather than
    // recomputed from a frame count) so live slider changes never cause jumps.
    const periodPhases: number[] = [];

    p.setup = () => {
      p.createCanvas(p.windowWidth, p.windowHeight);
      p.strokeWeight(CANVAS_SETTINGS.strokeWeight);
      p.noFill();
    };

    p.draw = () => {
      const backgroundColor = getBackgroundColor();
      const waveColor = getWaveColor();
      const waveCount = getWaveCount();
      const amplitudes = getAmplitudes();
      const baseWavelength = getWavelength();
      const baseFrequency = getFrequency();
      const basePeriod = getPeriod();
      const baseRotation = getRotation();
      const baseCurvature = getCurvature();
      const baseSpacing = getSpacing();
      const baseThickness = getThickness();
      const taper = getTaperAmount(getTaper());
      const offset = getOffset();
      
      const cachedWavelengthVariations = getCachedWavelengthVariations();
      const cachedFrequencyVariations = getCachedFrequencyVariations();
      const cachedPeriodVariations = getCachedPeriodVariations();
      const cachedRotationVariations = getCachedRotationVariations();
      const cachedCurvatureVariations = getCachedCurvatureVariations();
      const cachedSpacingVariations = getCachedSpacingVariations();
      const cachedThicknessVariations = getCachedThicknessVariations();

      // Accumulate each wave's period-variation drift (on top of the shared
      // base scroll `offset`), so varied waves gradually fall out of sync.
      for (let i = 0; i < waveCount; i++) {
        periodPhases[i] = (periodPhases[i] ?? 0) + (cachedPeriodVariations[i] ?? 0);
      }
      setPeriodPhases(periodPhases);

      // Clear to fully transparent first, then paint the (possibly translucent)
      // background as a single composite. Without the clear, a background color
      // with alpha < 1 would accumulate over previous frames and smear the waves.
      p.clear();
      p.background(backgroundColor);
      if (taper > 0) {
        p.noStroke();
        p.fill(waveColor);
      } else {
        p.noFill();
        p.stroke(waveColor);
      }

      // Gap between waves is an absolute pixel value (BASE_SPACING * spacing),
      // independent of the canvas width, so a given config renders identically
      // on any screen size.
      const adjustedSpacing = BASE_SPACING * baseSpacing;

      const centerX = p.width / 2;
      const centerY = p.height / 2;

      // Each wave is a near-vertical line rotated point-by-point around the
      // canvas center. We draw every wave much taller than the canvas (out to
      // its bounding circle, plus margin for amplitude and stroke width) so a
      // single wave still spans the whole canvas at ANY rotation without leaving
      // a triangular cutout at the top/bottom.
      const maxAmplitude = amplitudes.reduce(
        (max, a) => Math.max(max, Math.abs(a ?? 0)),
        0
      );
      const maxThickness = waveCount > 0
        ? Math.max(
            ...Array.from({ length: waveCount }, (_, idx) =>
              clampThickness(
                baseThickness + (cachedThicknessVariations[idx] ?? 0)
              ) * getMaxTaperMultiplier(taper)
            )
          )
        : THICKNESS_RANGE.min;
      const coverRadius =
        Math.hypot(p.width, p.height) / 2 +
        maxAmplitude +
        maxThickness;

      // Draw EXACTLY waveCount waves as a horizontally centered block, so the
      // wave count is literal: 1 means one wave, 5 means five.
      for (let i = 0; i < waveCount; i++) {
        const idx = i;
        const amplitude = amplitudes[idx] ?? 0;
        const waveWavelength = baseWavelength + (cachedWavelengthVariations[idx] ?? 0);
        const waveFrequency = baseFrequency + (cachedFrequencyVariations[idx] ?? 0);
        const waveRotation = baseRotation + (cachedRotationVariations[idx] ?? 0);
        const waveCurvature = baseCurvature + (cachedCurvatureVariations[idx] ?? 0);
        const waveThickness = clampThickness(
          baseThickness + (cachedThicknessVariations[idx] ?? 0)
        );
        const rotationRadians = waveRotation * Math.PI / 180;
        const rotationCos = Math.cos(rotationRadians);
        const rotationSin = Math.sin(rotationRadians);

        // Spacing variation jitters each wave's position by a fraction of the
        // gap (values are pre-scaled to ±SPACING_JITTER_MAX_FRACTION).
        const spacingJitter = (cachedSpacingVariations[idx] ?? 0) * adjustedSpacing;
        const x = centerX + (i - (waveCount - 1) / 2) * adjustedSpacing + spacingJitter;

        // Shared base scroll plus this wave's accumulated period-variation drift.
        const wavePhase = offset + (periodPhases[idx] ?? 0);

        if (taper > 0) {
          drawVariableWidthWaveP5(
            p,
            x,
            centerY - coverRadius,
            centerY + coverRadius,
            CANVAS_SETTINGS.vertexStep,
            amplitude,
            waveWavelength,
            wavePhase,
            waveFrequency,
            waveCurvature,
            coverRadius,
            waveThickness,
            taper,
            idx * 0.85,
            centerX,
            centerY,
            rotationCos,
            rotationSin
          );
        } else {
          p.strokeWeight(waveThickness);
          p.beginShape();
          for (let y = centerY - coverRadius; y <= centerY + coverRadius; y += CANVAS_SETTINGS.vertexStep) {
            const waveX = x + getCurvatureOffset(y, centerY, coverRadius, waveCurvature) +
              p.sin(y * waveWavelength + wavePhase + waveFrequency) * amplitude;
            const rotatedPoint = rotatePoint(waveX, y, centerX, centerY, rotationCos, rotationSin);
            p.vertex(rotatedPoint.x, rotatedPoint.y);
          }
          p.endShape();
        }
      }

      setOffset(offset + basePeriod);
    };

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
    };
  };
}

/**
 * Renders a wave to an off-screen canvas at a specific resolution
 * This is used for exporting waves as PNG files
 * The spacing and other calculations are scaled based on the original canvas dimensions
 * to ensure the export looks identical to what the user sees
 */
export function renderWaveToCanvas(
  width: number,
  height: number,
  amplitudes: number[],
  waveCount: number,
  wavelength: number,
  frequency: number,
  period: number,
  rotation: number,
  curvature: number,
  spacing: number,
  thickness: number,
  taper: number,
  waveColor: string,
  backgroundColor: string,
  offset: number,
  cachedWavelengthVariations: number[],
  cachedFrequencyVariations: number[],
  cachedPeriodVariations: number[],
  cachedRotationVariations: number[],
  cachedCurvatureVariations: number[],
  cachedSpacingVariations: number[],
  cachedThicknessVariations: number[],
  periodPhases: number[] = [],
  originalCanvasWidth: number = width,
  originalCanvasHeight: number = height
): HTMLCanvasElement | null {
  try {
    // Create an off-screen canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Set background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Set drawing style for waves
    ctx.strokeStyle = waveColor;
    ctx.fillStyle = waveColor;
    
    // Calculate the scale ratio to maintain consistent spacing and appearance
    const scaleX = width / originalCanvasWidth;
    const scaleY = height / originalCanvasHeight;
    
    // Scale stroke weight proportionally (use average scale)
    const avgScale = (scaleX + scaleY) / 2;
    ctx.lineWidth = clampThickness(thickness) * avgScale;

    // Gap is an absolute pixel value (BASE_SPACING * spacing), matching the
    // live sketch so the export reproduces exactly what's on screen, then
    // scaled to the export dimensions.
    const baseSp = BASE_SPACING;
    const adjustedSpacing = baseSp * spacing;
    const scaledAdjustedSpacing = adjustedSpacing * scaleX;

    // Scale vertex step for smooth rendering at different resolutions
    const scaledVertexStep = Math.max(1, Math.round(CANVAS_SETTINGS.vertexStep / avgScale));

    const centerX = width / 2;
    const centerY = height / 2;

    // Draw each wave much taller than the canvas so it spans any rotation
    // without an edge cutout (mirrors createWaveSketch).
    const maxScaledAmplitude = amplitudes.reduce(
      (max, a) => Math.max(max, Math.abs((a ?? 0) * scaleX)),
      0
    );
    const taperAmount = getTaperAmount(taper);
    const maxScaledThickness = waveCount > 0
      ? Math.max(
          ...Array.from({ length: waveCount }, (_, idx) =>
            clampThickness(
              thickness + (cachedThicknessVariations[idx] ?? 0)
            ) * avgScale * getMaxTaperMultiplier(taperAmount)
          )
        )
      : THICKNESS_RANGE.min * avgScale;
    const coverRadius =
      Math.hypot(width, height) / 2 + maxScaledAmplitude + maxScaledThickness;

    // Draw EXACTLY waveCount waves as a horizontally centered block, matching
    // the live sketch (wave count is literal).
    for (let i = 0; i < waveCount; i++) {
      const idx = i;
      const scaledAmplitude = (amplitudes[idx] ?? 0) * scaleX;
      const waveWavelength = wavelength + (cachedWavelengthVariations[idx] ?? 0);
      const waveFrequency = frequency + (cachedFrequencyVariations[idx] ?? 0);
      const waveRotation = rotation + (cachedRotationVariations[idx] ?? 0);
      const waveCurvature = curvature + (cachedCurvatureVariations[idx] ?? 0);
      const waveThickness = clampThickness(
        thickness + (cachedThicknessVariations[idx] ?? 0)
      ) * avgScale;
      const rotationRadians = waveRotation * Math.PI / 180;
      const rotationCos = Math.cos(rotationRadians);
      const rotationSin = Math.sin(rotationRadians);

      const spacingJitter = (cachedSpacingVariations[idx] ?? 0) * scaledAdjustedSpacing;
      const x = centerX + (i - (waveCount - 1) / 2) * scaledAdjustedSpacing + spacingJitter;

      // Match the live sketch: shared base scroll plus this wave's period drift.
      const wavePhase = offset + (periodPhases[idx] ?? 0);

      if (taperAmount > 0) {
        drawVariableWidthWaveCanvas(
          ctx,
          x,
          centerY - coverRadius,
          centerY + coverRadius,
          scaledVertexStep,
          scaledAmplitude,
          waveWavelength,
          wavePhase,
          waveFrequency,
          waveCurvature,
          coverRadius,
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
        for (let y = centerY - coverRadius; y <= centerY + coverRadius; y += scaledVertexStep) {
          const waveX = x + getCurvatureOffset(y, centerY, coverRadius, waveCurvature) +
            Math.sin(y * waveWavelength + wavePhase + waveFrequency) * scaledAmplitude;
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

    return canvas;
  } catch (error) {
    console.error('Error rendering wave to canvas:', error);
    return null;
  }
}
