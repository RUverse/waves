import type p5 from 'p5';
import type { WaveAttribute } from './types';
import { 
  DEFAULT_AMPLITUDE, 
  DEFAULT_WAVE_COUNT, 
  DEFAULT_WAVELENGTH,
  DEFAULT_FREQUENCY,
  DEFAULT_PERIOD,
  DEFAULT_SPACING,
  DEFAULT_WAVE_COLOR,
  DEFAULT_BACKGROUND_COLOR,
  WAVE_GENERATION,
  CANVAS_SETTINGS
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

export function resetSpacing(): number {
  return DEFAULT_SPACING;
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

/**
 * Creates a p5 sketch function for rendering waves
 */
export function createWaveSketch(
  getAmplitudes: () => number[],
  getWaveCount: () => number,
  getWavelength: () => number,
  getFrequency: () => number,
  getPeriod: () => number,
  getSpacing: () => number,
  getWaveColor: () => string,
  getBackgroundColor: () => string,
  getOffset: () => number,
  setOffset: (value: number) => void,
  getCachedWavelengthVariations: () => number[] = () => [],
  getCachedFrequencyVariations: () => number[] = () => [],
  getCachedPeriodVariations: () => number[] = () => [],
  getCachedSpacingVariations: () => number[] = () => []
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
      const baseSpacing = getSpacing();
      const offset = getOffset();
      
      const cachedWavelengthVariations = getCachedWavelengthVariations();
      const cachedFrequencyVariations = getCachedFrequencyVariations();
      const cachedPeriodVariations = getCachedPeriodVariations();
      const cachedSpacingVariations = getCachedSpacingVariations();

      p.background(backgroundColor);
      p.stroke(waveColor);

      // Calculate base spacing and apply spacing multiplier
      const baseSp = p.width / (waveCount + 1);
      const adjustedSpacing = baseSp * baseSpacing;
      const totalWidth = adjustedSpacing * waveCount;
      const startOffset = (p.width - totalWidth) / 2;

      for (let i = 0; i < waveCount && i < amplitudes.length; i++) {
        // Apply cached per-wave variations to each attribute
        const waveWavelength = baseWavelength + (cachedWavelengthVariations[i] ?? 0);
        const waveFrequency = baseFrequency + (cachedFrequencyVariations[i] ?? 0);
        const wavePeriod = basePeriod + (cachedPeriodVariations[i] ?? 0);
        
        let x = startOffset + adjustedSpacing * (i + 1);

        p.beginShape();
        for (let y = 0; y <= p.height; y += CANVAS_SETTINGS.vertexStep) {
          let waveX = x + p.sin(y * waveWavelength + offset + waveFrequency) * amplitudes[i];
          p.vertex(waveX, y);
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
  spacing: number,
  waveColor: string,
  backgroundColor: string,
  offset: number,
  cachedWavelengthVariations: number[],
  cachedFrequencyVariations: number[],
  cachedPeriodVariations: number[],
  cachedSpacingVariations: number[],
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
    ctx.lineWidth = CANVAS_SETTINGS.strokeWeight * avgScale;

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

    // Draw each wave
    for (let i = 0; i < waveCount && i < amplitudes.length; i++) {
      const waveWavelength = wavelength + (cachedWavelengthVariations[i] ?? 0);
      const waveFrequency = frequency + (cachedFrequencyVariations[i] ?? 0);
      const wavePeriod = period + (cachedPeriodVariations[i] ?? 0);

      let x = scaledStartOffset + scaledAdjustedSpacing * (i + 1);

      ctx.beginPath();
      for (let y = 0; y <= height; y += scaledVertexStep) {
        // Scale amplitude based on the scale ratio
        const scaledAmplitude = amplitudes[i] * scaleX;
        const waveX = x + Math.sin(y * waveWavelength + offset + waveFrequency) * scaledAmplitude;
        if (y === 0) {
          ctx.moveTo(waveX, y);
        } else {
          ctx.lineTo(waveX, y);
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
