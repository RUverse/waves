export interface ValueRange {
  min: number;
  max: number;
}

export interface WaveAttribute {
  displayName: string;
  name: string;
  value: ValueRange;
  variation: ValueRange;
}

export interface WaveState {
  amplitude: number;
  wavelength: number;
  frequency: number;
  period: number;
  rotation: number;
  curvature: number;
  spacing: number;
  thickness: number;
  taper: number;
  waveCount: number;
  ampToggle: boolean;
  waveToggle: boolean;
  freqToggle: boolean;
  perToggle: boolean;
  rotationToggle: boolean;
  spacingToggle: boolean;
  waveCountToggle: boolean;
  showPanel: boolean;
  waveColor?: string;
  backgroundColor?: string;
  amplitudeVariation?: number;
  wavelengthVariation?: number;
  frequencyVariation?: number;
  periodVariation?: number;
  rotationVariation?: number;
  curvatureVariation?: number;
  spacingVariation?: number;
  thicknessVariation?: number;
}
