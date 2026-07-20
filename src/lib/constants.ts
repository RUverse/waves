// Wave parameter defaults
export const DEFAULT_AMPLITUDE = 40;
export const DEFAULT_WAVELENGTH = 0.02;
export const DEFAULT_FREQUENCY = 0.5;
export const DEFAULT_PERIOD = 0.05;
export const DEFAULT_ROTATION = 0;
export const DEFAULT_CURVATURE = 0;
export const DEFAULT_GLITCH = 0;

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

export const ROTATION_RANGE = {
  min: -180,
  max: 180,
  step: 1,
  default: DEFAULT_ROTATION
};

// Dimensionless sideways bend of the wave centerline. At ±1, the centerline
// is displaced by one rendered vertical radius at its outermost sampled
// points. Negative values bend in the opposite direction.
export const CURVATURE_RANGE = {
  min: -1,
  max: 1,
  step: 0.01,
  default: DEFAULT_CURVATURE
};

// Intensity of the animated, banded horizontal displacement effect.
export const GLITCH_RANGE = {
  min: 0,
  max: 1,
  step: 0.01,
  default: DEFAULT_GLITCH
};

// Absolute gap (in px) between adjacent waves when the spacing multiplier is
// 1.0. Spacing is measured against this constant instead of the live canvas
// width, so a given config renders identically on any screen size — a larger
// screen simply shows more waves at the same scale rather than stretching the
// whole pattern.
export const BASE_SPACING = 240;

// Spacing is the density control: gap = BASE_SPACING * spacing.
// Lower = waves packed tighter, higher = spread apart. Viewport-independent.
// Near 0 the waves collapse onto each other; negative values mirror the block
// (reverse the wave order) and let waves cross over.
export const DEFAULT_SPACING = 1.0;

export const SPACING_RANGE = {
  min: -3.0,
  max: 3.0,
  step: 0.1,
  default: DEFAULT_SPACING
};

// Wave count is the number of DISTINCT waves in the repeating pattern (the
// motif length / variety), not the number drawn on screen. The motif is tiled
// to fill the canvas, so this is viewport-independent. It only has a visible
// effect when some per-wave variation is non-zero.
export const DEFAULT_WAVE_COUNT = 5;

export const WAVE_COUNT_RANGE = {
  min: 1,
  max: 30,
  step: 1,
  default: DEFAULT_WAVE_COUNT
};

// Max per-wave positional jitter from spacing variation, as a fraction of the
// gap. Kept below 0.5 so jittered waves never cross into an adjacent slot.
export const SPACING_JITTER_MAX_FRACTION = 0.48;

// The numeric text inputs (pro mode) accept values up to this multiple of a
// slider's range, beyond the slider handle's own limits, for power users who
// want to push a setting further than the slider allows.
export const INPUT_RANGE_FACTOR = 4;

// Default wave thickness
export const DEFAULT_THICKNESS = 2;

export const THICKNESS_RANGE = {
  min: 1,
  max: 20,
  step: 0.5,
  default: DEFAULT_THICKNESS
};

// Default wave taper amount
export const DEFAULT_TAPER = 0;

export const TAPER_RANGE = {
  min: 0,
  max: 1,
  step: 0.01,
  default: DEFAULT_TAPER
};

// UI defaults
export const DEFAULT_TOGGLES = {
  amplitude: true,
  wavelength: false,
  frequency: false,
  period: false,
  rotation: false,
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
  strokeWeight: DEFAULT_THICKNESS,
  vertexStep: 5
};

// Wave generation settings
export const WAVE_GENERATION = {
  amplitudeVariation: 0.4, // ±20% variation (0.8 to 1.2 multiplier)
  randomSeedRange: 0.04 // Range for wavelength randomization
};

// Default variation values (strength of random variation applied to each attribute)
export const DEFAULT_AMPLITUDE_VARIATION = 0;
export const DEFAULT_WAVELENGTH_VARIATION = 0;
export const DEFAULT_FREQUENCY_VARIATION = 0;
export const DEFAULT_PERIOD_VARIATION = 0;
export const DEFAULT_ROTATION_VARIATION = 0;
export const DEFAULT_CURVATURE_VARIATION = 0;
export const DEFAULT_SPACING_VARIATION = 0;
export const DEFAULT_THICKNESS_VARIATION = 0;

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

export const ROTATION_VARIATION_RANGE = {
  min: 0,
  max: 1.0,
  step: 0.01,
  default: DEFAULT_ROTATION_VARIATION
};

export const CURVATURE_VARIATION_RANGE = {
  min: 0,
  max: 1.0,
  step: 0.01,
  default: DEFAULT_CURVATURE_VARIATION
};

export const SPACING_VARIATION_RANGE = {
  min: 0,
  max: 1.0,
  step: 0.01,
  default: DEFAULT_SPACING_VARIATION
};

export const THICKNESS_VARIATION_RANGE = {
  min: 0,
  max: 1.0,
  step: 0.01,
  default: DEFAULT_THICKNESS_VARIATION
};
