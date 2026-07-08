import type p5 from 'p5';
import type { WaveAttribute } from './types';
import { 
  DEFAULT_AMPLITUDE, 
  DEFAULT_WAVE_COUNT, 
  DEFAULT_WAVELENGTH,
  DEFAULT_FREQUENCY,
  DEFAULT_PERIOD,
  DEFAULT_ROTATION,
  DEFAULT_SPACING,
  DEFAULT_THICKNESS,
  DEFAULT_WAVE_COLOR,
  DEFAULT_BACKGROUND_COLOR,
  WAVE_GENERATION,
  CANVAS_SETTINGS,
  THICKNESS_RANGE
} from './constants';

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

export function resetSpacing(): number {
  return DEFAULT_SPACING;
}

export function resetThickness(): number {
  return DEFAULT_THICKNESS;
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

/**
 * Simple seeded pseudo-random number generator for consistent wave variation
 */
function seededRandom(seed: number): number {
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

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
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
  getSpacing: () => number,
  getThickness: () => number,
  getWaveColor: () => string,
  getBackgroundColor: () => string,
  getOffset: () => number,
  setOffset: (value: number) => void,
  getCachedWavelengthVariations: () => number[] = () => [],
  getCachedFrequencyVariations: () => number[] = () => [],
  getCachedPeriodVariations: () => number[] = () => [],
  getCachedRotationVariations: () => number[] = () => [],
  getCachedSpacingVariations: () => number[] = () => [],
  getCachedThicknessVariations: () => number[] = () => []
) {
  return (p: p5) => {
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
      const baseSpacing = getSpacing();
      const baseThickness = getThickness();
      const offset = getOffset();
      
      const cachedWavelengthVariations = getCachedWavelengthVariations();
      const cachedFrequencyVariations = getCachedFrequencyVariations();
      const cachedRotationVariations = getCachedRotationVariations();
      const cachedSpacingVariations = getCachedSpacingVariations();
      const cachedThicknessVariations = getCachedThicknessVariations();

      p.background(backgroundColor);
      p.stroke(waveColor);

      // Calculate base spacing and apply spacing multiplier
      const baseSp = p.width / (waveCount + 1);
      const adjustedSpacing = baseSp * baseSpacing;
      const totalWidth = adjustedSpacing * waveCount;
      const startOffset = (p.width - totalWidth) / 2;

      const centerX = p.width / 2;
      const centerY = p.height / 2;

      // Each wave is a near-vertical line that we rotate point-by-point around the
      // canvas center. A line only as tall as the canvas leaves triangular gaps at
      // the edges once it's tilted ("cutout"). To keep the canvas fully covered at
      // ANY rotation, we extend both the length of every wave and the number of
      // waves so the pattern always fills the canvas's bounding circle (half the
      // diagonal, plus margin for amplitude and stroke width).
      const maxAmplitude = amplitudes.reduce(
        (max, a) => Math.max(max, Math.abs(a ?? 0)),
        0
      );
      const maxThickness = waveCount > 0
        ? Math.max(
            ...Array.from({ length: waveCount }, (_, idx) =>
              clamp(
                baseThickness + (cachedThicknessVariations[idx] ?? 0),
                THICKNESS_RANGE.min,
                THICKNESS_RANGE.max
              )
            )
          )
        : THICKNESS_RANGE.min;
      const coverRadius =
        Math.hypot(p.width, p.height) / 2 +
        maxAmplitude +
        maxThickness;

      // Range of wave indices whose base position falls within the bounding circle.
      // Indices outside [0, waveCount) are wrapped so the extra waves that fill the
      // corners seamlessly tile the same (possibly varied) pattern.
      let iMin = 0;
      let iMax = waveCount - 1;
      if (waveCount > 0 && adjustedSpacing > 0) {
        iMin = Math.floor((centerX - coverRadius - startOffset) / adjustedSpacing - 1) - 1;
        iMax = Math.ceil((centerX + coverRadius - startOffset) / adjustedSpacing - 1) + 1;
      }

      for (let i = iMin; i <= iMax; i++) {
        // Wrap index into the valid range for per-wave attributes
        const idx = ((i % waveCount) + waveCount) % waveCount;
        const amplitude = amplitudes[idx] ?? 0;
        const waveWavelength = baseWavelength + (cachedWavelengthVariations[idx] ?? 0);
        const waveFrequency = baseFrequency + (cachedFrequencyVariations[idx] ?? 0);
        const waveRotation = baseRotation + (cachedRotationVariations[idx] ?? 0);
        const waveThickness = clamp(
          baseThickness + (cachedThicknessVariations[idx] ?? 0),
          THICKNESS_RANGE.min,
          THICKNESS_RANGE.max
        );
        const rotationRadians = waveRotation * Math.PI / 180;
        const rotationCos = Math.cos(rotationRadians);
        const rotationSin = Math.sin(rotationRadians);

        const x = startOffset + adjustedSpacing * (i + 1);

        p.strokeWeight(waveThickness);
        p.beginShape();
        for (let y = centerY - coverRadius; y <= centerY + coverRadius; y += CANVAS_SETTINGS.vertexStep) {
          const waveX = x + p.sin(y * waveWavelength + offset + waveFrequency) * amplitude;
          const dx = waveX - centerX;
          const dy = y - centerY;
          const rotatedX = centerX + dx * rotationCos - dy * rotationSin;
          const rotatedY = centerY + dx * rotationSin + dy * rotationCos;
          p.vertex(rotatedX, rotatedY);
        }
        p.endShape();
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
  spacing: number,
  thickness: number,
  waveColor: string,
  backgroundColor: string,
  offset: number,
  cachedWavelengthVariations: number[],
  cachedFrequencyVariations: number[],
  cachedPeriodVariations: number[],
  cachedRotationVariations: number[],
  cachedSpacingVariations: number[],
  cachedThicknessVariations: number[],
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

    // Set stroke style for waves
    ctx.strokeStyle = waveColor;
    
    // Calculate the scale ratio to maintain consistent spacing and appearance
    const scaleX = width / originalCanvasWidth;
    const scaleY = height / originalCanvasHeight;
    
    // Scale stroke weight proportionally (use average scale)
    const avgScale = (scaleX + scaleY) / 2;
    ctx.lineWidth = clamp(thickness, THICKNESS_RANGE.min, THICKNESS_RANGE.max) * avgScale;

    // Calculate spacing based on original canvas width, then scale to export dimensions
    // This ensures the waves appear at the same visual positions regardless of export size
    const baseSp = originalCanvasWidth / (waveCount + 1);
    const adjustedSpacing = baseSp * spacing;
    const totalWidth = adjustedSpacing * waveCount;
    const startOffset = (originalCanvasWidth - totalWidth) / 2;

    // Scale positions to export dimensions
    const scaledStartOffset = startOffset * scaleX;
    const scaledAdjustedSpacing = adjustedSpacing * scaleX;
    
    // Scale vertex step for smooth rendering at different resolutions
    const scaledVertexStep = Math.max(1, Math.round(CANVAS_SETTINGS.vertexStep / avgScale));

    const centerX = width / 2;
    const centerY = height / 2;

    // Extend the wave length and count so the pattern fully covers the canvas at
    // any rotation, avoiding edge cutouts (mirrors createWaveSketch).
    const maxScaledAmplitude = amplitudes.reduce(
      (max, a) => Math.max(max, Math.abs((a ?? 0) * scaleX)),
      0
    );
    const maxScaledThickness = waveCount > 0
      ? Math.max(
          ...Array.from({ length: waveCount }, (_, idx) =>
            clamp(
              thickness + (cachedThicknessVariations[idx] ?? 0),
              THICKNESS_RANGE.min,
              THICKNESS_RANGE.max
            ) * avgScale
          )
        )
      : THICKNESS_RANGE.min * avgScale;
    const coverRadius =
      Math.hypot(width, height) / 2 + maxScaledAmplitude + maxScaledThickness;

    let iMin = 0;
    let iMax = waveCount - 1;
    if (waveCount > 0 && scaledAdjustedSpacing > 0) {
      iMin = Math.floor((centerX - coverRadius - scaledStartOffset) / scaledAdjustedSpacing - 1) - 1;
      iMax = Math.ceil((centerX + coverRadius - scaledStartOffset) / scaledAdjustedSpacing - 1) + 1;
    }

    // Draw each wave
    for (let i = iMin; i <= iMax; i++) {
      // Wrap index into the valid range so the extra corner-filling waves tile
      const idx = ((i % waveCount) + waveCount) % waveCount;
      const scaledAmplitude = (amplitudes[idx] ?? 0) * scaleX;
      const waveWavelength = wavelength + (cachedWavelengthVariations[idx] ?? 0);
      const waveFrequency = frequency + (cachedFrequencyVariations[idx] ?? 0);
      const waveRotation = rotation + (cachedRotationVariations[idx] ?? 0);
      const waveThickness = clamp(
        thickness + (cachedThicknessVariations[idx] ?? 0),
        THICKNESS_RANGE.min,
        THICKNESS_RANGE.max
      ) * avgScale;
      const rotationRadians = waveRotation * Math.PI / 180;
      const rotationCos = Math.cos(rotationRadians);
      const rotationSin = Math.sin(rotationRadians);

      const x = scaledStartOffset + scaledAdjustedSpacing * (i + 1);

      ctx.lineWidth = waveThickness;
      ctx.beginPath();
      let first = true;
      for (let y = centerY - coverRadius; y <= centerY + coverRadius; y += scaledVertexStep) {
        const waveX = x + Math.sin(y * waveWavelength + offset + waveFrequency) * scaledAmplitude;
        const dx = waveX - centerX;
        const dy = y - centerY;
        const rotatedX = centerX + dx * rotationCos - dy * rotationSin;
        const rotatedY = centerY + dx * rotationSin + dy * rotationCos;
        if (first) {
          ctx.moveTo(rotatedX, rotatedY);
          first = false;
        } else {
          ctx.lineTo(rotatedX, rotatedY);
        }
      }
      ctx.stroke();
    }

    return canvas;
  } catch (error) {
    console.error('Error rendering wave to canvas:', error);
    return null;
  }
}
