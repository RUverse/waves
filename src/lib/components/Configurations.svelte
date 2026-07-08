<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Label } from '$lib/components/ui/label';
  import { Slider } from '$lib/components/ui/slider';
  import ResetIcon from './ResetIcon.svelte';
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
  <div>
    <div class="flex items-center space-x-2">
      <Button 
        onclick={onResetAmplitude}
        variant="ghost"
        class="glass-btn w-6 h-6 p-0 rounded-md flex items-center justify-center"
        title="Reset amplitude"
      >
        <ResetIcon />
      </Button>
      <Label class="text-white w-16 sm:w-24">Amplitude</Label>
      <Slider 
        bind:value={amplitude} 
        min={AMPLITUDE_RANGE.min} 
        max={AMPLITUDE_RANGE.max} 
        step={AMPLITUDE_RANGE.step}
        class="w-24 sm:w-32"
      />
      {#if nerdMode}
        <span class="text-white text-xs w-12 text-right">{amplitude.toFixed(1)}</span>
      {/if}
    </div>
    {#if nerdMode}
      <div class="flex items-center space-x-2 ml-8 mt-1">
        <Label class="text-white text-xs w-12">Var:</Label>
        <Slider 
          bind:value={amplitudeVariation} 
          min={AMPLITUDE_VARIATION_RANGE.min} 
          max={AMPLITUDE_VARIATION_RANGE.max} 
          step={AMPLITUDE_VARIATION_RANGE.step}
          class="w-24 sm:w-32"
        />
        <span class="text-white text-xs w-12 text-right">{amplitudeVariation.toFixed(2)}</span>
        <Button 
          onclick={onResetAmplitudeVariation}
          variant="ghost"
          class="glass-btn w-6 h-6 p-0 rounded-md flex items-center justify-center"
          title="Reset to default"
        >
          <ResetIcon />
        </Button>
      </div>
    {/if}
  </div>
  
  <div>
    <div class="flex items-center space-x-2">
      <Button 
        onclick={onResetWavelength}
        variant="ghost"
        class="glass-btn w-6 h-6 p-0 rounded-md flex items-center justify-center"
        title="Reset wavelength"
      >
        <ResetIcon />
      </Button>
      <Label class="text-white w-16 sm:w-24">Wavelength</Label>
      <Slider 
        bind:value={wavelength} 
        min={WAVELENGTH_RANGE.min} 
        max={WAVELENGTH_RANGE.max} 
        step={WAVELENGTH_RANGE.step}
        class="w-24 sm:w-32"
      />
      {#if nerdMode}
        <span class="text-white text-xs w-12 text-right">{wavelength.toFixed(3)}</span>
      {/if}
    </div>
    {#if nerdMode}
      <div class="flex items-center space-x-2 ml-8 mt-1">
        <Label class="text-white text-xs w-12">Var:</Label>
        <Slider 
          bind:value={wavelengthVariation} 
          min={WAVELENGTH_VARIATION_RANGE.min} 
          max={WAVELENGTH_VARIATION_RANGE.max} 
          step={WAVELENGTH_VARIATION_RANGE.step}
          class="w-24 sm:w-32"
        />
        <span class="text-white text-xs w-12 text-right">{wavelengthVariation.toFixed(2)}</span>
        <Button 
          onclick={onResetWavelengthVariation}
          variant="ghost"
          class="glass-btn w-6 h-6 p-0 rounded-md flex items-center justify-center"
          title="Reset to default"
        >
          <ResetIcon />
        </Button>
      </div>
    {/if}
  </div>
  
  <div>
    <div class="flex items-center space-x-2">
      <Button 
        onclick={onResetFrequency}
        variant="ghost"
        class="glass-btn w-6 h-6 p-0 rounded-md flex items-center justify-center"
        title="Reset frequency"
      >
        <ResetIcon />
      </Button>
      <Label class="text-white w-16 sm:w-24">Frequency</Label>
      <Slider 
        bind:value={frequency} 
        min={FREQUENCY_RANGE.min} 
        max={FREQUENCY_RANGE.max} 
        step={FREQUENCY_RANGE.step}
        class="w-24 sm:w-32"
      />
      {#if nerdMode}
        <span class="text-white text-xs w-12 text-right">{frequency.toFixed(2)}</span>
      {/if}
    </div>
    {#if nerdMode}
      <div class="flex items-center space-x-2 ml-8 mt-1">
        <Label class="text-white text-xs w-12">Var:</Label>
        <Slider 
          bind:value={frequencyVariation} 
          min={FREQUENCY_VARIATION_RANGE.min} 
          max={FREQUENCY_VARIATION_RANGE.max} 
          step={FREQUENCY_VARIATION_RANGE.step}
          class="w-24 sm:w-32"
        />
        <span class="text-white text-xs w-12 text-right">{frequencyVariation.toFixed(2)}</span>
        <Button 
          onclick={onResetFrequencyVariation}
          variant="ghost"
          class="glass-btn w-6 h-6 p-0 rounded-md flex items-center justify-center"
          title="Reset to default"
        >
          <ResetIcon />
        </Button>
      </div>
    {/if}
  </div>
  
  <div>
    <div class="flex items-center space-x-2">
      <Button 
        onclick={onResetPeriod}
        variant="ghost"
        class="glass-btn w-6 h-6 p-0 rounded-md flex items-center justify-center"
        title="Reset period"
      >
        <ResetIcon />
      </Button>
      <Label class="text-white w-16 sm:w-24">Period</Label>
      <Slider 
        bind:value={period} 
        min={PERIOD_RANGE.min} 
        max={PERIOD_RANGE.max} 
        step={PERIOD_RANGE.step}
        class="w-24 sm:w-32"
      />
      {#if nerdMode}
        <span class="text-white text-xs w-12 text-right">{period.toFixed(3)}</span>
      {/if}
    </div>
    {#if nerdMode}
      <div class="flex items-center space-x-2 ml-8 mt-1">
        <Label class="text-white text-xs w-12">Var:</Label>
        <Slider 
          bind:value={periodVariation} 
          min={PERIOD_VARIATION_RANGE.min} 
          max={PERIOD_VARIATION_RANGE.max} 
          step={PERIOD_VARIATION_RANGE.step}
          class="w-24 sm:w-32"
        />
        <span class="text-white text-xs w-12 text-right">{periodVariation.toFixed(2)}</span>
        <Button 
          onclick={onResetPeriodVariation}
          variant="ghost"
          class="glass-btn w-6 h-6 p-0 rounded-md flex items-center justify-center"
          title="Reset to default"
        >
          <ResetIcon />
        </Button>
      </div>
    {/if}
  </div>
  
  <div>
    <div class="flex items-center space-x-2">
      <Button 
        onclick={onResetRotation}
        variant="ghost"
        class="glass-btn w-6 h-6 p-0 rounded-md flex items-center justify-center"
        title="Reset rotation"
      >
        <ResetIcon />
      </Button>
      <Label class="text-white w-16 sm:w-24">Rotation</Label>
      <Slider 
        bind:value={rotation} 
        min={ROTATION_RANGE.min} 
        max={ROTATION_RANGE.max} 
        step={ROTATION_RANGE.step}
        class="w-24 sm:w-32"
      />
      {#if nerdMode}
        <span class="text-white text-xs w-12 text-right">{rotation.toFixed(0)}°</span>
      {/if}
    </div>
    {#if nerdMode}
      <div class="flex items-center space-x-2 ml-8 mt-1">
        <Label class="text-white text-xs w-12">Var:</Label>
        <Slider 
          bind:value={rotationVariation} 
          min={ROTATION_VARIATION_RANGE.min} 
          max={ROTATION_VARIATION_RANGE.max} 
          step={ROTATION_VARIATION_RANGE.step}
          class="w-24 sm:w-32"
        />
        <span class="text-white text-xs w-12 text-right">{rotationVariation.toFixed(2)}</span>
        <Button 
          onclick={onResetRotationVariation}
          variant="ghost"
          class="glass-btn w-6 h-6 p-0 rounded-md flex items-center justify-center"
          title="Reset to default"
        >
          <ResetIcon />
        </Button>
      </div>
    {/if}
  </div>
  
  <div>
    <div class="flex items-center space-x-2">
      <Button 
        onclick={onResetSpacing}
        variant="ghost"
        class="glass-btn w-6 h-6 p-0 rounded-md flex items-center justify-center"
        title="Reset spacing"
      >
        <ResetIcon />
      </Button>
      <Label class="text-white w-16 sm:w-24">Spacing</Label>
      <Slider 
        bind:value={spacing} 
        min={SPACING_RANGE.min} 
        max={SPACING_RANGE.max} 
        step={SPACING_RANGE.step}
        class="w-24 sm:w-32"
      />
      {#if nerdMode}
        <span class="text-white text-xs w-12 text-right">{spacing.toFixed(2)}</span>
      {/if}
    </div>
    {#if nerdMode}
      <div class="flex items-center space-x-2 ml-8 mt-1">
        <Label class="text-white text-xs w-12">Var:</Label>
        <Slider 
          bind:value={spacingVariation} 
          min={SPACING_VARIATION_RANGE.min} 
          max={SPACING_VARIATION_RANGE.max} 
          step={SPACING_VARIATION_RANGE.step}
          class="w-24 sm:w-32"
        />
        <span class="text-white text-xs w-12 text-right">{spacingVariation.toFixed(2)}</span>
        <Button 
          onclick={onResetSpacingVariation}
          variant="ghost"
          class="glass-btn w-6 h-6 p-0 rounded-md flex items-center justify-center"
          title="Reset to default"
        >
          <ResetIcon />
        </Button>
      </div>
    {/if}
  </div>
  
  <div>
    <div class="flex items-center space-x-2">
      <Button 
        onclick={onResetThickness}
        variant="ghost"
        class="glass-btn w-6 h-6 p-0 rounded-md flex items-center justify-center"
        title="Reset thickness"
      >
        <ResetIcon />
      </Button>
      <Label class="text-white w-16 sm:w-24">Thickness</Label>
      <Slider 
        bind:value={thickness} 
        min={THICKNESS_RANGE.min} 
        max={THICKNESS_RANGE.max} 
        step={THICKNESS_RANGE.step}
        class="w-24 sm:w-32"
      />
      {#if nerdMode}
        <span class="text-white text-xs w-12 text-right">{thickness.toFixed(1)}</span>
      {/if}
    </div>
    {#if nerdMode}
      <div class="flex items-center space-x-2 ml-8 mt-1">
        <Label class="text-white text-xs w-12">Var:</Label>
        <Slider 
          bind:value={thicknessVariation} 
          min={THICKNESS_VARIATION_RANGE.min} 
          max={THICKNESS_VARIATION_RANGE.max} 
          step={THICKNESS_VARIATION_RANGE.step}
          class="w-24 sm:w-32"
        />
        <span class="text-white text-xs w-12 text-right">{thicknessVariation.toFixed(2)}</span>
        <Button 
          onclick={onResetThicknessVariation}
          variant="ghost"
          class="glass-btn w-6 h-6 p-0 rounded-md flex items-center justify-center"
          title="Reset to default"
        >
          <ResetIcon />
        </Button>
      </div>
    {/if}
  </div>
  
  <div>
    <div class="flex items-center space-x-2">
      <Button 
        onclick={onResetTaper}
        variant="ghost"
        class="glass-btn w-6 h-6 p-0 rounded-md flex items-center justify-center"
        title="Reset taper"
      >
        <ResetIcon />
      </Button>
      <Label class="text-white w-16 sm:w-24">Taper</Label>
      <Slider 
        bind:value={taper} 
        min={TAPER_RANGE.min} 
        max={TAPER_RANGE.max} 
        step={TAPER_RANGE.step}
        class="w-24 sm:w-32"
      />
      {#if nerdMode}
        <span class="text-white text-xs w-12 text-right">{taper.toFixed(2)}</span>
      {/if}
    </div>
  </div>
  
  <div>
    <div class="flex items-center space-x-2">
      <Button 
        onclick={onResetWaveCount}
        variant="ghost"
        class="glass-btn w-6 h-6 p-0 rounded-md flex items-center justify-center"
        title="Reset wave count"
      >
        <ResetIcon />
      </Button>
      <Label class="text-white w-16 sm:w-24">Wave Count</Label>
      <Slider 
        bind:value={waveCount} 
        min={WAVE_COUNT_RANGE.min} 
        max={WAVE_COUNT_RANGE.max} 
        step={WAVE_COUNT_RANGE.step}
        class="w-24 sm:w-32"
      />
      {#if nerdMode}
        <span class="text-white text-xs w-12 text-right">{waveCount}</span>
      {/if}
    </div>
  </div>
</div>
