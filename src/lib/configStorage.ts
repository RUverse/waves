import {
  DEFAULT_BACKGROUND_COLOR,
  DEFAULT_TAPER,
  DEFAULT_THICKNESS,
  DEFAULT_THICKNESS_VARIATION,
  DEFAULT_WAVE_COLOR
} from './constants';

export interface WaveConfig {
  amplitude: number;
  wavelength: number;
  frequency: number;
  period: number;
  rotation?: number;
  spacing: number;
  thickness?: number;
  taper?: number;
  waveCount: number;
  ampToggle: boolean;
  waveToggle: boolean;
  freqToggle: boolean;
  perToggle: boolean;
  rotationToggle?: boolean;
  spacingToggle: boolean;
  waveCountToggle: boolean;
  waveColor?: string;
  backgroundColor?: string;
  baseAmplitudes: number[];
  amplitudeVariation?: number;
  wavelengthVariation?: number;
  frequencyVariation?: number;
  periodVariation?: number;
  rotationVariation?: number;
  spacingVariation?: number;
  thicknessVariation?: number;
}

export interface Wave {
  id: string;
  name: string;
  config: WaveConfig;
  timestamp: number;
}

const SAVED_WAVES_KEY = 'ruwaves-saved-waves';

/**
 * Generates a deterministic 10-character base ID based on config values.
 * New saved records still need collision handling because two saves can have
 * identical configs.
 */
export function generateWaveId(config: WaveConfig): string {
  // Create a string from key config values
  const configString = [
    config.amplitude,
    config.wavelength,
    config.frequency,
    config.period,
    config.rotation ?? 0,
    config.spacing,
    config.thickness ?? DEFAULT_THICKNESS,
    config.taper ?? DEFAULT_TAPER,
    config.thicknessVariation ?? DEFAULT_THICKNESS_VARIATION,
    config.waveColor ?? DEFAULT_WAVE_COLOR,
    config.backgroundColor ?? DEFAULT_BACKGROUND_COLOR,
    config.waveCount,
    (config.baseAmplitudes ?? []).slice(0, 3).join(',') // First 3 amplitudes for uniqueness
  ].join('|');
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < configString.length; i++) {
    const char = configString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Convert to base36 and pad/trim to 10 chars
  const base36 = Math.abs(hash).toString(36);
  return base36.padEnd(10, '0').substring(0, 10);
}

export function generateUniqueWaveId(config: WaveConfig, existingIds: Iterable<string> = []): string {
  return getUniqueId(generateWaveId(config), existingIds);
}

export function loadSavedWaves(): Wave[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(SAVED_WAVES_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    if (!Array.isArray(parsed)) {
      return [];
    }

    const waves = normalizeSavedWaves(parsed);
    if (JSON.stringify(waves) !== JSON.stringify(parsed)) {
      saveSavedWaves(waves);
    }

    return waves;
  } catch (error) {
    console.error('Failed to load saved waves:', error);
    return [];
  }
}

export function saveSavedWaves(waves: Wave[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SAVED_WAVES_KEY, JSON.stringify(waves));
  } catch (error) {
    console.error('Failed to save waves:', error);
  }
}

export function createWave(config: WaveConfig, existingIds: Iterable<string> = []): Wave {
  const normalizedConfig = normalizeWaveConfig(config);
  const id = generateUniqueWaveId(normalizedConfig, existingIds);
  return {
    id,
    name: id, // Default name is the ID
    config: normalizedConfig,
    timestamp: Date.now()
  };
}

export function normalizeWaveConfig(config: WaveConfig): WaveConfig {
  return {
    amplitude: config.amplitude,
    wavelength: config.wavelength,
    frequency: config.frequency,
    period: config.period,
    rotation: config.rotation,
    spacing: config.spacing,
    thickness: config.thickness,
    taper: config.taper,
    waveCount: config.waveCount,
    ampToggle: config.ampToggle,
    waveToggle: config.waveToggle,
    freqToggle: config.freqToggle,
    perToggle: config.perToggle,
    rotationToggle: config.rotationToggle,
    spacingToggle: config.spacingToggle,
    waveCountToggle: config.waveCountToggle,
    waveColor: config.waveColor ?? DEFAULT_WAVE_COLOR,
    backgroundColor: config.backgroundColor ?? DEFAULT_BACKGROUND_COLOR,
    baseAmplitudes: Array.isArray(config.baseAmplitudes) ? config.baseAmplitudes : [],
    amplitudeVariation: config.amplitudeVariation,
    wavelengthVariation: config.wavelengthVariation,
    frequencyVariation: config.frequencyVariation,
    periodVariation: config.periodVariation,
    rotationVariation: config.rotationVariation,
    spacingVariation: config.spacingVariation,
    thicknessVariation: config.thicknessVariation
  };
}

function normalizeSavedWaves(waves: unknown[]): Wave[] {
  const usedIds = new Set<string>();
  const normalized: Wave[] = [];

  for (const storedWave of waves) {
    if (!storedWave || typeof storedWave !== 'object') {
      continue;
    }

    const wave = storedWave as Partial<Wave>;
    if (!wave.config || typeof wave.config !== 'object') {
      continue;
    }

    const config = normalizeWaveConfig(wave.config as WaveConfig);
    const storedId = typeof wave.id === 'string' ? wave.id.trim() : '';
    const baseId = storedId || generateWaveId(config);
    const id = getUniqueId(baseId, usedIds);
    usedIds.add(id);

    const storedName = typeof wave.name === 'string' ? wave.name.trim() : '';
    const name = storedName && storedName !== baseId ? storedName : id;
    const timestamp = Number(wave.timestamp);

    normalized.push({
      id,
      name,
      config,
      timestamp: Number.isFinite(timestamp) ? timestamp : Date.now()
    });
  }

  return normalized;
}

function getUniqueId(baseId: string, existingIds: Iterable<string>): string {
  const usedIds = new Set(existingIds);
  let id = baseId;
  let suffix = 1;

  while (usedIds.has(id)) {
    id = `${baseId}-${suffix}`;
    suffix += 1;
  }

  return id;
}
