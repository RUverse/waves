<script lang="ts">
  import SettingRow from './SettingRow.svelte';
  import {
    AMPLITUDE_RANGE,
    WAVELENGTH_RANGE,
    FREQUENCY_RANGE,
    PERIOD_RANGE,
    ROTATION_RANGE,
    SPACING_RANGE,
    THICKNESS_RANGE,
    TAPER_RANGE,
    WAVE_COUNT_RANGE,
    AMPLITUDE_VARIATION_RANGE,
    WAVELENGTH_VARIATION_RANGE,
    FREQUENCY_VARIATION_RANGE,
    PERIOD_VARIATION_RANGE,
    ROTATION_VARIATION_RANGE,
    SPACING_VARIATION_RANGE,
    THICKNESS_VARIATION_RANGE
  } from '$lib/constants';

  export let amplitude: number;
  export let wavelength: number;
  export let frequency: number;
  export let period: number;
  export let rotation: number;
  export let spacing: number;
  export let thickness: number;
  export let taper: number;
  export let waveCount: number;
  export let nerdMode: boolean;
  export let onResetAmplitude: () => void;
  export let onResetWavelength: () => void;
  export let onResetFrequency: () => void;
  export let onResetPeriod: () => void;
  export let onResetRotation: () => void;
  export let onResetSpacing: () => void;
  export let onResetThickness: () => void;
  export let onResetTaper: () => void;
  export let onResetWaveCount: () => void;
  export let amplitudeVariation: number;
  export let wavelengthVariation: number;
  export let frequencyVariation: number;
  export let periodVariation: number;
  export let rotationVariation: number;
  export let spacingVariation: number;
  export let thicknessVariation: number;
  export let onResetAmplitudeVariation: () => void;
  export let onResetWavelengthVariation: () => void;
  export let onResetFrequencyVariation: () => void;
  export let onResetPeriodVariation: () => void;
  export let onResetRotationVariation: () => void;
  export let onResetSpacingVariation: () => void;
  export let onResetThicknessVariation: () => void;
</script>

<div class="flex flex-col gap-3">
  <SettingRow
    label="Wave Count"
    bind:value={waveCount}
    min={WAVE_COUNT_RANGE.min}
    max={WAVE_COUNT_RANGE.max}
    step={WAVE_COUNT_RANGE.step}
    decimals={0}
    onReset={onResetWaveCount}
    {nerdMode}
  />

  <SettingRow
    label="Amplitude"
    bind:value={amplitude}
    min={AMPLITUDE_RANGE.min}
    max={AMPLITUDE_RANGE.max}
    step={AMPLITUDE_RANGE.step}
    decimals={1}
    onReset={onResetAmplitude}
    {nerdMode}
    hasVariation
    bind:variation={amplitudeVariation}
    variationMin={AMPLITUDE_VARIATION_RANGE.min}
    variationMax={AMPLITUDE_VARIATION_RANGE.max}
    variationStep={AMPLITUDE_VARIATION_RANGE.step}
    onResetVariation={onResetAmplitudeVariation}
  />

  <SettingRow
    label="Wavelength"
    bind:value={wavelength}
    min={WAVELENGTH_RANGE.min}
    max={WAVELENGTH_RANGE.max}
    step={WAVELENGTH_RANGE.step}
    decimals={3}
    onReset={onResetWavelength}
    {nerdMode}
    hasVariation
    bind:variation={wavelengthVariation}
    variationMin={WAVELENGTH_VARIATION_RANGE.min}
    variationMax={WAVELENGTH_VARIATION_RANGE.max}
    variationStep={WAVELENGTH_VARIATION_RANGE.step}
    onResetVariation={onResetWavelengthVariation}
  />

  <SettingRow
    label="Frequency"
    bind:value={frequency}
    min={FREQUENCY_RANGE.min}
    max={FREQUENCY_RANGE.max}
    step={FREQUENCY_RANGE.step}
    decimals={2}
    onReset={onResetFrequency}
    {nerdMode}
    hasVariation
    bind:variation={frequencyVariation}
    variationMin={FREQUENCY_VARIATION_RANGE.min}
    variationMax={FREQUENCY_VARIATION_RANGE.max}
    variationStep={FREQUENCY_VARIATION_RANGE.step}
    onResetVariation={onResetFrequencyVariation}
  />

  <SettingRow
    label="Period"
    bind:value={period}
    min={PERIOD_RANGE.min}
    max={PERIOD_RANGE.max}
    step={PERIOD_RANGE.step}
    decimals={3}
    onReset={onResetPeriod}
    {nerdMode}
    hasVariation
    bind:variation={periodVariation}
    variationMin={PERIOD_VARIATION_RANGE.min}
    variationMax={PERIOD_VARIATION_RANGE.max}
    variationStep={PERIOD_VARIATION_RANGE.step}
    onResetVariation={onResetPeriodVariation}
  />

  <SettingRow
    label="Rotation"
    bind:value={rotation}
    min={ROTATION_RANGE.min}
    max={ROTATION_RANGE.max}
    step={ROTATION_RANGE.step}
    decimals={0}
    onReset={onResetRotation}
    {nerdMode}
    hasVariation
    bind:variation={rotationVariation}
    variationMin={ROTATION_VARIATION_RANGE.min}
    variationMax={ROTATION_VARIATION_RANGE.max}
    variationStep={ROTATION_VARIATION_RANGE.step}
    onResetVariation={onResetRotationVariation}
  />

  <SettingRow
    label="Spacing"
    bind:value={spacing}
    min={SPACING_RANGE.min}
    max={SPACING_RANGE.max}
    step={SPACING_RANGE.step}
    decimals={2}
    onReset={onResetSpacing}
    {nerdMode}
    hasVariation
    bind:variation={spacingVariation}
    variationMin={SPACING_VARIATION_RANGE.min}
    variationMax={SPACING_VARIATION_RANGE.max}
    variationStep={SPACING_VARIATION_RANGE.step}
    onResetVariation={onResetSpacingVariation}
  />

  <SettingRow
    label="Thickness"
    bind:value={thickness}
    min={THICKNESS_RANGE.min}
    max={THICKNESS_RANGE.max}
    step={THICKNESS_RANGE.step}
    decimals={1}
    onReset={onResetThickness}
    {nerdMode}
    hasVariation
    bind:variation={thicknessVariation}
    variationMin={THICKNESS_VARIATION_RANGE.min}
    variationMax={THICKNESS_VARIATION_RANGE.max}
    variationStep={THICKNESS_VARIATION_RANGE.step}
    onResetVariation={onResetThicknessVariation}
  />

  <SettingRow
    label="Taper"
    bind:value={taper}
    min={TAPER_RANGE.min}
    max={TAPER_RANGE.max}
    step={TAPER_RANGE.step}
    decimals={2}
    onReset={onResetTaper}
    {nerdMode}
  />
</div>
