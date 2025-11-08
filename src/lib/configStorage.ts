export interface WaveConfig {
  amplitude: number;
  wavelength: number;
  frequency: number;
  period: number;
  spacing: number;
  waveCount: number;
  ampToggle: boolean;
  waveToggle: boolean;
  freqToggle: boolean;
  perToggle: boolean;
  spacingToggle: boolean;
  waveCountToggle: boolean;
  baseAmplitudes: number[];
}

export interface Wave {
  id: string;
  name: string;
  config: WaveConfig;
  timestamp: number;
}

const SAVED_WAVES_KEY = 'ruwaves-saved-waves';

/**
 * Generates a deterministic 10-character ID based on config values
 */
export function generateWaveId(config: WaveConfig): string {
  // Create a string from key config values
  const configString = [
    config.amplitude,
    config.wavelength,
    config.frequency,
    config.period,
    config.spacing,
    config.waveCount,
    config.baseAmplitudes.slice(0, 3).join(',') // First 3 amplitudes for uniqueness
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

export function loadSavedWaves(): Wave[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(SAVED_WAVES_KEY);
    return stored ? JSON.parse(stored) : [];
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

export function createWave(config: WaveConfig): Wave {
  const id = generateWaveId(config);
  return {
    id,
    name: id, // Default name is the ID
    config,
    timestamp: Date.now()
  };
}
