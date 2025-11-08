// Wave parameter defaults
export const DEFAULT_AMPLITUDE = 40;
export const DEFAULT_WAVELENGTH = 0.02;
export const DEFAULT_FREQUENCY = 0.5;
export const DEFAULT_PERIOD = 0.05;

// Wave parameter ranges for sliders
export const AMPLITUDE_RANGE = {
  min: -60,
  max: 140,
  step: 1,
  default: DEFAULT_AMPLITUDE
};

export const WAVELENGTH_RANGE = {
  min: -0.08,
  max: 0.12,
  step: 0.001,
  default: DEFAULT_WAVELENGTH
};

export const FREQUENCY_RANGE = {
  min: -0.3,
  max: 1.3,
  step: 0.01,
  default: DEFAULT_FREQUENCY
};

export const PERIOD_RANGE = {
  min: -0.03,
  max: 0.13,
  step: 0.001,
  default: DEFAULT_PERIOD
};

// Default spacing (1.0 = normal spacing based on window width)
export const DEFAULT_SPACING = 1.0;

export const SPACING_RANGE = {
  min: 0.3,
  max: 3.0,
  step: 0.1,
  default: DEFAULT_SPACING
};

// Default wave count
export const DEFAULT_WAVE_COUNT = 5;

export const WAVE_COUNT_RANGE = {
  min: 1,
  max: 20,
  step: 1,
  default: DEFAULT_WAVE_COUNT
};

// UI defaults
export const DEFAULT_TOGGLES = {
  amplitude: true,
  wavelength: false,
  frequency: false,
  period: false,
  spacing: false,
  waveCount: false
};

export const DEFAULT_SHOW_PANEL = true;

// Color defaults
export const DEFAULT_WAVE_COLOR = '#ffffff';
export const DEFAULT_BACKGROUND_COLOR = '#000000';

// p5.js canvas settings
export const CANVAS_SETTINGS = {
  backgroundColor: 0,
  strokeColor: 255,
  strokeWeight: 2,
  vertexStep: 5
};

// Wave generation settings
export const WAVE_GENERATION = {
  amplitudeVariation: 0.4, // ±20% variation (0.8 to 1.2 multiplier)
  randomSeedRange: 0.04 // Range for wavelength randomization
};

// Default variation values (strength of random variation applied to each attribute)
export const DEFAULT_AMPLITUDE_VARIATION = 0.4;
export const DEFAULT_WAVELENGTH_VARIATION = 0;
export const DEFAULT_FREQUENCY_VARIATION = 0;
export const DEFAULT_PERIOD_VARIATION = 0;
export const DEFAULT_SPACING_VARIATION = 0;

// Variation ranges for sliders (how much variation can be applied)
export const AMPLITUDE_VARIATION_RANGE = {
  min: 0,
  max: 1.0,
  step: 0.01,
  default: DEFAULT_AMPLITUDE_VARIATION
};

export const WAVELENGTH_VARIATION_RANGE = {
  min: 0,
  max: 0.2,
  step: 0.01,
  default: DEFAULT_WAVELENGTH_VARIATION
};

export const FREQUENCY_VARIATION_RANGE = {
  min: 0,
  max: 2.0,
  step: 0.1,
  default: DEFAULT_FREQUENCY_VARIATION
};

export const PERIOD_VARIATION_RANGE = {
  min: 0,
  max: 0.2,
  step: 0.01,
  default: DEFAULT_PERIOD_VARIATION
};

export const SPACING_VARIATION_RANGE = {
  min: 0,
  max: 2.0,
  step: 0.1,
  default: DEFAULT_SPACING_VARIATION
};
