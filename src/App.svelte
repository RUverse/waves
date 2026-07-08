<script lang="ts">
  import './app.css';
  import p5 from 'p5';
  import { onMount } from 'svelte';
  import ControlPanel from '$lib/components/ControlPanel.svelte';
  import SettingsModal from '$lib/components/SettingsModal.svelte';
  import ExportModal from '$lib/components/ExportModal.svelte';
  import { 
    generateInitialAmplitudes,
    generateCachedVariations,
    createWaveSketch,
    renderWaveToCanvas,
    resetAmplitude as resetAmplitudeValue,
    resetWavelength as resetWavelengthValue,
    resetFrequency as resetFrequencyValue,
    resetPeriod as resetPeriodValue,
    resetRotation as resetRotationValue,
    resetSpacing as resetSpacingValue,
    resetThickness as resetThicknessValue,
    resetWaveCount as resetWaveCountValue,
    resetWaveColor as resetWaveColorValue,
    resetBackgroundColor as resetBackgroundColorValue
  } from '$lib/waveLogic';
  import { loadState, saveState } from '$lib/storage';
  import { loadSettings, saveSettings } from '$lib/settingsStorage';
  import type { WaveState } from '$lib/types';
  import { createWaveManagement } from '$hooks/useWaveManagement';
  import type { Wave, WaveConfig } from '$lib/configStorage';
  import {
    DEFAULT_AMPLITUDE,
    DEFAULT_WAVELENGTH,
    DEFAULT_FREQUENCY,
    DEFAULT_PERIOD,
    DEFAULT_ROTATION,
    DEFAULT_SPACING,
    DEFAULT_THICKNESS,
    DEFAULT_WAVE_COUNT,
    DEFAULT_AMPLITUDE_VARIATION,
    DEFAULT_WAVELENGTH_VARIATION,
    DEFAULT_FREQUENCY_VARIATION,
    DEFAULT_PERIOD_VARIATION,
    DEFAULT_ROTATION_VARIATION,
    DEFAULT_SPACING_VARIATION,
    DEFAULT_THICKNESS_VARIATION,
    DEFAULT_TOGGLES,
    DEFAULT_SHOW_PANEL,
    DEFAULT_WAVE_COLOR,
    DEFAULT_BACKGROUND_COLOR,
    CANVAS_SETTINGS,
    WAVE_GENERATION,
    AMPLITUDE_RANGE,
    WAVELENGTH_RANGE,
    FREQUENCY_RANGE,
    PERIOD_RANGE,
    ROTATION_RANGE,
    SPACING_RANGE,
    THICKNESS_RANGE,
    WAVE_COUNT_RANGE
  } from '$lib/constants';

  // Load saved state
  const savedState = loadState();
  
  // Wave parameters
  let amplitude = savedState?.amplitude ?? DEFAULT_AMPLITUDE;
  let wavelength = savedState?.wavelength ?? DEFAULT_WAVELENGTH;
  let frequency = savedState?.frequency ?? DEFAULT_FREQUENCY;
  let period = savedState?.period ?? DEFAULT_PERIOD;
  let rotation = savedState?.rotation ?? DEFAULT_ROTATION;
  let spacing = savedState?.spacing ?? DEFAULT_SPACING;
  let thickness = savedState?.thickness ?? DEFAULT_THICKNESS;
  let waveCount = savedState?.waveCount ?? DEFAULT_WAVE_COUNT;
  let offset = 0;
  
  // Wave variation (strength of random variation per attribute)
  let amplitudeVariation = savedState?.amplitudeVariation ?? DEFAULT_AMPLITUDE_VARIATION;
  let wavelengthVariation = savedState?.wavelengthVariation ?? DEFAULT_WAVELENGTH_VARIATION;
  let frequencyVariation = savedState?.frequencyVariation ?? DEFAULT_FREQUENCY_VARIATION;
  let periodVariation = savedState?.periodVariation ?? DEFAULT_PERIOD_VARIATION;
  let rotationVariation = savedState?.rotationVariation ?? DEFAULT_ROTATION_VARIATION;
  let spacingVariation = savedState?.spacingVariation ?? DEFAULT_SPACING_VARIATION;
  let thicknessVariation = savedState?.thicknessVariation ?? DEFAULT_THICKNESS_VARIATION;
  
  // Seed for regenerating all random variations
  let variationSeed = 0;

  // Base amplitudes for each wave (not including variations)
  let baseAmplitudes: number[] = [];
  
  // Cached per-wave variations (fixed seed values for each wave index)
  let cachedAmplitudeVariations: number[] = [];
  let cachedWavelengthVariations: number[] = [];
  let cachedFrequencyVariations: number[] = [];
  let cachedPeriodVariations: number[] = [];
  let cachedRotationVariations: number[] = [];
  let cachedSpacingVariations: number[] = [];
  let cachedThicknessVariations: number[] = [];
  
  // UI state
  let ampToggle = savedState?.ampToggle ?? DEFAULT_TOGGLES.amplitude;
  let waveToggle = savedState?.waveToggle ?? DEFAULT_TOGGLES.wavelength;
  let freqToggle = savedState?.freqToggle ?? DEFAULT_TOGGLES.frequency;
  let perToggle = savedState?.perToggle ?? DEFAULT_TOGGLES.period;
  let rotationToggle = savedState?.rotationToggle ?? DEFAULT_TOGGLES.rotation;
  let spacingToggle = savedState?.spacingToggle ?? DEFAULT_TOGGLES.spacing;
  let waveCountToggle = savedState?.waveCountToggle ?? DEFAULT_TOGGLES.waveCount;
  let showPanel = savedState?.showPanel ?? DEFAULT_SHOW_PANEL;

  // p5 instance
  let p5Instance: p5;
  
  // Track current canvas dimensions for consistent export scaling
  let currentCanvasWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
  let currentCanvasHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;

  // Saved waves management
  const waveManagement = createWaveManagement();
  let savedWaves: Wave[] = [];
  let activeWaveId: string | null = null;
  let savedWaveSnapshot: string | null = null;
  
  // Subscribe to wave management stores
  waveManagement.savedWaves.subscribe((value: Wave[]) => savedWaves = value);
  waveManagement.activeWaveId.subscribe((value: string | null) => activeWaveId = value);
  waveManagement.savedWaveSnapshot.subscribe((value: string | null) => savedWaveSnapshot = value);

  // Load settings
  const savedSettings = loadSettings();
  
  // Modal state
  let showSettingsModal = false;
  let showExportModal = false;
  let nerdMode = savedSettings.nerdMode;

  // Color settings
  let waveColor = savedState?.waveColor ?? DEFAULT_WAVE_COLOR;
  let backgroundColor = savedState?.backgroundColor ?? DEFAULT_BACKGROUND_COLOR;

  // Computed amplitudes based on cached variations and current amplitude slider
  $: amplitudes = cachedAmplitudeVariations.map(variation => amplitude + variation);

  // Check if current config has unsaved changes
  $: currentWaveConfigString = JSON.stringify({
    amplitude, wavelength, frequency, period, rotation, spacing, thickness, waveCount,
    ampToggle, waveToggle, freqToggle, perToggle, rotationToggle, spacingToggle, waveCountToggle,
    baseAmplitudes,
    amplitudeVariation, wavelengthVariation, frequencyVariation, periodVariation, rotationVariation, spacingVariation, thicknessVariation
  });
  $: hasUnsavedChanges = activeWaveId !== null && savedWaveSnapshot !== null && currentWaveConfigString !== savedWaveSnapshot;

  // Track variation trigger to regenerate cached variations
  $: {
    if (waveCount > 0) {
      cachedAmplitudeVariations = generateCachedVariations(waveCount, amplitudeVariation, AMPLITUDE_RANGE.min, AMPLITUDE_RANGE.max, variationSeed - 1000);
      cachedWavelengthVariations = generateCachedVariations(waveCount, wavelengthVariation, WAVELENGTH_RANGE.min, WAVELENGTH_RANGE.max, variationSeed);
      cachedFrequencyVariations = generateCachedVariations(waveCount, frequencyVariation, FREQUENCY_RANGE.min, FREQUENCY_RANGE.max, variationSeed + 1000);
      cachedPeriodVariations = generateCachedVariations(waveCount, periodVariation, PERIOD_RANGE.min, PERIOD_RANGE.max, variationSeed + 2000);
      cachedRotationVariations = generateCachedVariations(waveCount, rotationVariation, ROTATION_RANGE.min, ROTATION_RANGE.max, variationSeed + 3000);
      cachedSpacingVariations = generateCachedVariations(waveCount, spacingVariation, SPACING_RANGE.min, SPACING_RANGE.max, variationSeed + 4000);
      cachedThicknessVariations = generateCachedVariations(waveCount, thicknessVariation, THICKNESS_RANGE.min, THICKNESS_RANGE.max, variationSeed + 5000);
    }
  }

  // Auto-save state whenever it changes
  $: if (typeof window !== 'undefined') {
    const state: WaveState = {
      amplitude,
      wavelength,
      frequency,
      period,
      rotation,
      spacing,
      thickness,
      waveCount,
      ampToggle,
      waveToggle,
      freqToggle,
      perToggle,
      rotationToggle,
      spacingToggle,
      waveCountToggle,
      showPanel,
      waveColor,
      backgroundColor,
      amplitudeVariation,
      wavelengthVariation,
      frequencyVariation,
      periodVariation,
      rotationVariation,
      spacingVariation,
      thicknessVariation
    };
    saveState(state);
  }

  function togglePanel() {
    showPanel = !showPanel;
  }

  function reset() {
    variationSeed += 10000 + Math.random() * 1000;
    wavelength = DEFAULT_WAVELENGTH + (Math.random() - 0.5) * WAVE_GENERATION.randomSeedRange;
    frequency = DEFAULT_FREQUENCY + (Math.random() - 0.5) * 0.8;
    period = DEFAULT_PERIOD + (Math.random() - 0.5) * 0.08;
    rotation = DEFAULT_ROTATION + (Math.random() - 0.5) * 120;
    spacing = DEFAULT_SPACING + (Math.random() - 0.5) * 1.0;
    thickness = Math.max(
      THICKNESS_RANGE.min,
      Math.min(THICKNESS_RANGE.max, DEFAULT_THICKNESS + (Math.random() - 0.5) * 4)
    );
    waveCount = Math.floor(DEFAULT_WAVE_COUNT + (Math.random() - 0.5) * 10);
    waveCount = Math.max(1, Math.min(20, waveCount)); // Clamp between 1 and 20
  }

  function resetConfig() {
    amplitude = DEFAULT_AMPLITUDE;
    wavelength = DEFAULT_WAVELENGTH;
    frequency = DEFAULT_FREQUENCY;
    period = DEFAULT_PERIOD;
    rotation = DEFAULT_ROTATION;
    spacing = DEFAULT_SPACING;
    thickness = DEFAULT_THICKNESS;
    waveCount = DEFAULT_WAVE_COUNT;
    amplitudeVariation = DEFAULT_AMPLITUDE_VARIATION;
    wavelengthVariation = DEFAULT_WAVELENGTH_VARIATION;
    frequencyVariation = DEFAULT_FREQUENCY_VARIATION;
    periodVariation = DEFAULT_PERIOD_VARIATION;
    rotationVariation = DEFAULT_ROTATION_VARIATION;
    spacingVariation = DEFAULT_SPACING_VARIATION;
    thicknessVariation = DEFAULT_THICKNESS_VARIATION;
    ampToggle = DEFAULT_TOGGLES.amplitude;
    waveToggle = DEFAULT_TOGGLES.wavelength;
    freqToggle = DEFAULT_TOGGLES.frequency;
    perToggle = DEFAULT_TOGGLES.period;
    rotationToggle = DEFAULT_TOGGLES.rotation;
    spacingToggle = DEFAULT_TOGGLES.spacing;
    waveCountToggle = DEFAULT_TOGGLES.waveCount;
    waveColor = DEFAULT_WAVE_COLOR;
    backgroundColor = DEFAULT_BACKGROUND_COLOR;
    waveManagement.clearActiveWave();
  }

  // Helper to create config from current state
  const getCurrentConfig = (): WaveConfig => ({
    amplitude, wavelength, frequency, period, rotation, spacing, thickness, waveCount,
    ampToggle, waveToggle, freqToggle, perToggle, rotationToggle, spacingToggle, waveCountToggle,
    baseAmplitudes,
    amplitudeVariation, wavelengthVariation, frequencyVariation, periodVariation, rotationVariation, spacingVariation, thicknessVariation
  });

  // Helper to apply config to current state
  const applyConfig = (config: WaveConfig) => {
    amplitude = config.amplitude;
    wavelength = config.wavelength;
    frequency = config.frequency;
    period = config.period;
    rotation = config.rotation ?? DEFAULT_ROTATION;
    spacing = config.spacing;
    thickness = config.thickness ?? DEFAULT_THICKNESS;
    waveCount = config.waveCount;
    ampToggle = config.ampToggle;
    waveToggle = config.waveToggle;
    freqToggle = config.freqToggle;
    perToggle = config.perToggle;
    rotationToggle = config.rotationToggle ?? DEFAULT_TOGGLES.rotation;
    spacingToggle = config.spacingToggle;
    waveCountToggle = config.waveCountToggle;
    baseAmplitudes = config.baseAmplitudes;
    amplitudeVariation = config.amplitudeVariation ?? DEFAULT_AMPLITUDE_VARIATION;
    wavelengthVariation = config.wavelengthVariation ?? DEFAULT_WAVELENGTH_VARIATION;
    frequencyVariation = config.frequencyVariation ?? DEFAULT_FREQUENCY_VARIATION;
    periodVariation = config.periodVariation ?? DEFAULT_PERIOD_VARIATION;
    rotationVariation = config.rotationVariation ?? DEFAULT_ROTATION_VARIATION;
    spacingVariation = config.spacingVariation ?? DEFAULT_SPACING_VARIATION;
    thicknessVariation = config.thicknessVariation ?? DEFAULT_THICKNESS_VARIATION;
  };

  function openSettings() {
    showSettingsModal = true;
  }

  function closeSettings() {
    showSettingsModal = false;
  }

  function toggleNerdMode(value: boolean) {
    nerdMode = value;
    saveSettings({ nerdMode: value });
  }

  // Variation reset functions
  function resetAmplitudeVariation() {
    amplitudeVariation = DEFAULT_AMPLITUDE_VARIATION;
  }

  function resetWavelengthVariation() {
    wavelengthVariation = DEFAULT_WAVELENGTH_VARIATION;
  }

  function resetFrequencyVariation() {
    frequencyVariation = DEFAULT_FREQUENCY_VARIATION;
  }

  function resetPeriodVariation() {
    periodVariation = DEFAULT_PERIOD_VARIATION;
  }

  function resetRotationVariation() {
    rotationVariation = DEFAULT_ROTATION_VARIATION;
  }

  function resetSpacingVariation() {
    spacingVariation = DEFAULT_SPACING_VARIATION;
  }

  function resetThicknessVariation() {
    thicknessVariation = DEFAULT_THICKNESS_VARIATION;
  }

  function renderWave(width: number, height: number): HTMLCanvasElement | null {
    return renderWaveToCanvas(
      width,
      height,
      amplitudes,
      waveCount,
      wavelength,
      frequency,
      period,
      rotation,
      spacing,
      thickness,
      waveColor,
      backgroundColor,
      offset,
      cachedWavelengthVariations,
      cachedFrequencyVariations,
      cachedPeriodVariations,
      cachedRotationVariations,
      cachedSpacingVariations,
      cachedThicknessVariations,
      currentCanvasWidth,
      currentCanvasHeight
    );
  }

  function openExport() {
    showExportModal = true;
  }

  function closeExport() {
    showExportModal = false;
  }

  function handleExport() {
    // TODO: Implement export functionality
    console.log('Export not yet implemented');
    closeExport();
  }

  onMount(() => {
    // Cached variations will be generated by reactive statements
    const sketch = createWaveSketch(
      () => amplitudes,
      () => waveCount,
      () => wavelength,
      () => frequency,
      () => period,
      () => rotation,
      () => spacing,
      () => thickness,
      () => waveColor,
      () => backgroundColor,
      () => offset,
      (value) => { offset = value; },
      () => cachedWavelengthVariations,
      () => cachedFrequencyVariations,
      () => cachedPeriodVariations,
      () => cachedRotationVariations,
      () => cachedSpacingVariations,
      () => cachedThicknessVariations
    );

    const container = document.querySelector('#p5-container') as HTMLElement;
    p5Instance = new p5(sketch, container);

    // Track canvas resize for consistent export scaling
    const handleResize = () => {
      currentCanvasWidth = window.innerWidth;
      currentCanvasHeight = window.innerHeight;
    };

    // Keyboard shortcut: spacebar toggles panel
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        togglePanel();
      }
    };
    document.addEventListener('keydown', handleKeydown);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('keydown', handleKeydown);
      window.removeEventListener('resize', handleResize);
    };
  });
</script>

<div class="relative w-full h-screen bg-black">
  <div id="p5-container" class="absolute inset-0"></div>
  
  <ControlPanel
    bind:showPanel
    bind:amplitude
    bind:wavelength
    bind:frequency
    bind:period
    bind:rotation
    bind:spacing
    bind:thickness
    bind:waveCount
    savedWaves={savedWaves}
    activeWaveId={activeWaveId}
    {hasUnsavedChanges}
    onReset={reset}
    onResetConfig={resetConfig}
    onSaveConfig={() => waveManagement.saveWave(getCurrentConfig(), currentWaveConfigString)}
    onSaveConfigAsNew={() => waveManagement.saveConfigAsNew(getCurrentConfig(), currentWaveConfigString)}
    onSelectWave={(wave) => applyConfig(waveManagement.selectWave(wave))}
    onDeleteWave={(id) => waveManagement.deleteWave(id)}
    onTogglePanel={togglePanel}
    onOpenSettings={openSettings}
    onOpenExport={openExport}
    {nerdMode}
    onResetAmplitude={() => amplitude = resetAmplitudeValue()}
    onResetWavelength={() => wavelength = resetWavelengthValue()}
    onResetFrequency={() => frequency = resetFrequencyValue()}
    onResetPeriod={() => period = resetPeriodValue()}
    onResetRotation={() => rotation = resetRotationValue()}
    onResetSpacing={() => spacing = resetSpacingValue()}
    onResetThickness={() => thickness = resetThicknessValue()}
    onResetWaveCount={() => waveCount = resetWaveCountValue()}
    onResetWaveColor={() => waveColor = resetWaveColorValue()}
    onResetBackgroundColor={() => backgroundColor = resetBackgroundColorValue()}
    bind:amplitudeVariation
    bind:wavelengthVariation
    bind:frequencyVariation
    bind:periodVariation
    bind:rotationVariation
    bind:spacingVariation
    bind:thicknessVariation
    onResetAmplitudeVariation={resetAmplitudeVariation}
    onResetWavelengthVariation={resetWavelengthVariation}
    onResetFrequencyVariation={resetFrequencyVariation}
    onResetPeriodVariation={resetPeriodVariation}
    onResetRotationVariation={resetRotationVariation}
    onResetSpacingVariation={resetSpacingVariation}
    onResetThicknessVariation={resetThicknessVariation}
    bind:waveColor
    bind:backgroundColor
  />

  <SettingsModal
    isOpen={showSettingsModal}
    {nerdMode}
    onClose={closeSettings}
    onToggleNerdMode={toggleNerdMode}
  />

  <ExportModal
    isOpen={showExportModal}
    onClose={closeExport}
    onRenderWave={renderWave}
  />
</div>
