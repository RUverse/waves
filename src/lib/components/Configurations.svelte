<script lang="ts">
  import SettingRow from './SettingRow.svelte';
  import {
    AMPLITUDE_RANGE,
    WAVELENGTH_RANGE,
    FREQUENCY_RANGE,
    PERIOD_RANGE,
    ROTATION_RANGE,
    CURVATURE_RANGE,
    GLITCH_RANGE,
    SPACING_RANGE,
    THICKNESS_RANGE,
    TAPER_RANGE,
    WAVE_COUNT_RANGE,
    AMPLITUDE_VARIATION_RANGE,
    WAVELENGTH_VARIATION_RANGE,
    FREQUENCY_VARIATION_RANGE,
    PERIOD_VARIATION_RANGE,
    ROTATION_VARIATION_RANGE,
    CURVATURE_VARIATION_RANGE,
    SPACING_VARIATION_RANGE,
    THICKNESS_VARIATION_RANGE
  } from '$lib/constants';

  export let amplitude: number;
  export let wavelength: number;
  export let frequency: number;
  export let period: number;
  export let rotation: number;
  export let curvature: number;
  export let glitch: number;
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
  export let onResetCurvature: () => void;
  export let onResetGlitch: () => void;
  export let onResetSpacing: () => void;
  export let onResetThickness: () => void;
  export let onResetTaper: () => void;
  export let onResetWaveCount: () => void;
  export let amplitudeVariation: number;
  export let wavelengthVariation: number;
  export let frequencyVariation: number;
  export let periodVariation: number;
  export let rotationVariation: number;
  export let curvatureVariation: number;
  export let spacingVariation: number;
  export let thicknessVariation: number;
  export let onResetAmplitudeVariation: () => void;
  export let onResetWavelengthVariation: () => void;
  export let onResetFrequencyVariation: () => void;
  export let onResetPeriodVariation: () => void;
  export let onResetRotationVariation: () => void;
  export let onResetCurvatureVariation: () => void;
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
    defaultValue={WAVE_COUNT_RANGE.default}
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
    defaultValue={AMPLITUDE_RANGE.default}
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
    defaultValue={WAVELENGTH_RANGE.default}
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
    defaultValue={FREQUENCY_RANGE.default}
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
    defaultValue={PERIOD_RANGE.default}
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
    defaultValue={ROTATION_RANGE.default}
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

  {#if nerdMode}
    <SettingRow
      label="Curvature"
      bind:value={curvature}
      min={CURVATURE_RANGE.min}
      max={CURVATURE_RANGE.max}
      step={CURVATURE_RANGE.step}
      defaultValue={CURVATURE_RANGE.default}
      decimals={2}
      onReset={onResetCurvature}
      {nerdMode}
      hasVariation
      bind:variation={curvatureVariation}
      variationMin={CURVATURE_VARIATION_RANGE.min}
      variationMax={CURVATURE_VARIATION_RANGE.max}
      variationStep={CURVATURE_VARIATION_RANGE.step}
      onResetVariation={onResetCurvatureVariation}
    />

    <SettingRow
      label="Glitch"
      bind:value={glitch}
      min={GLITCH_RANGE.min}
      max={GLITCH_RANGE.max}
      step={GLITCH_RANGE.step}
      defaultValue={GLITCH_RANGE.default}
      decimals={2}
      onReset={onResetGlitch}
      {nerdMode}
    />
  {/if}

  <SettingRow
    label="Spacing"
    bind:value={spacing}
    min={SPACING_RANGE.min}
    max={SPACING_RANGE.max}
    step={SPACING_RANGE.step}
    defaultValue={SPACING_RANGE.default}
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
    defaultValue={THICKNESS_RANGE.default}
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
    defaultValue={TAPER_RANGE.default}
    decimals={2}
    onReset={onResetTaper}
    {nerdMode}
  />
</div>
