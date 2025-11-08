<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Switch } from '$lib/components/ui/switch';
  import { Label } from '$lib/components/ui/label';
  import { Slider } from '$lib/components/ui/slider';
  import {
    AMPLITUDE_RANGE,
    WAVELENGTH_RANGE,
    FREQUENCY_RANGE,
    PERIOD_RANGE,
    SPACING_RANGE,
    WAVE_COUNT_RANGE,
    AMPLITUDE_VARIATION_RANGE,
    WAVELENGTH_VARIATION_RANGE,
    FREQUENCY_VARIATION_RANGE,
    PERIOD_VARIATION_RANGE,
    SPACING_VARIATION_RANGE
  } from '$lib/constants';

  export let amplitude: number;
  export let wavelength: number;
  export let frequency: number;
  export let period: number;
  export let spacing: number;
  export let waveCount: number;
  export let ampToggle: boolean;
  export let waveToggle: boolean;
  export let freqToggle: boolean;
  export let perToggle: boolean;
  export let spacingToggle: boolean;
  export let waveCountToggle: boolean;
  export let nerdMode: boolean;
  export let onResetAmplitude: () => void;
  export let onResetWavelength: () => void;
  export let onResetFrequency: () => void;
  export let onResetPeriod: () => void;
  export let onResetSpacing: () => void;
  export let onResetWaveCount: () => void;
  export let amplitudeVariation: number;
  export let wavelengthVariation: number;
  export let frequencyVariation: number;
  export let periodVariation: number;
  export let spacingVariation: number;
  export let onResetAmplitudeVariation: () => void;
  export let onResetWavelengthVariation: () => void;
  export let onResetFrequencyVariation: () => void;
  export let onResetPeriodVariation: () => void;
  export let onResetSpacingVariation: () => void;
</script>

<div class="flex flex-col gap-3">
  <div>
    <div class="flex items-center space-x-2">
      <Switch id="amp" bind:checked={ampToggle} />
      <Label for="amp" class="text-white w-24">Amplitude</Label>
      <Slider 
        bind:value={amplitude} 
        min={AMPLITUDE_RANGE.min} 
        max={AMPLITUDE_RANGE.max} 
        step={AMPLITUDE_RANGE.step}
        class="w-32"
      />
      {#if nerdMode}
        <span class="text-white text-xs w-12 text-right">{amplitude.toFixed(1)}</span>
        <Button 
          onclick={onResetAmplitude}
          variant="outline"
          class="w-6 h-6 p-0 text-xs bg-transparent border-white border-opacity-30 hover:bg-white hover:bg-opacity-10"
          title="Reset to default"
        >
          ↺
        </Button>
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
          class="w-32"
        />
        <span class="text-white text-xs w-12 text-right">{amplitudeVariation.toFixed(2)}</span>
        <Button 
          onclick={onResetAmplitudeVariation}
          variant="outline"
          class="w-6 h-6 p-0 text-xs bg-transparent border-white border-opacity-30 hover:bg-white hover:bg-opacity-10"
          title="Reset to default"
        >
          ↺
        </Button>
      </div>
    {/if}
  </div>
  
  <div>
    <div class="flex items-center space-x-2">
      <Switch id="wave" bind:checked={waveToggle} />
      <Label for="wave" class="text-white w-24">Wavelength</Label>
      <Slider 
        bind:value={wavelength} 
        min={WAVELENGTH_RANGE.min} 
        max={WAVELENGTH_RANGE.max} 
        step={WAVELENGTH_RANGE.step}
        class="w-32"
      />
      {#if nerdMode}
        <span class="text-white text-xs w-12 text-right">{wavelength.toFixed(3)}</span>
        <Button 
          onclick={onResetWavelength}
          variant="outline"
          class="w-6 h-6 p-0 text-xs bg-transparent border-white border-opacity-30 hover:bg-white hover:bg-opacity-10"
          title="Reset to default"
        >
          ↺
        </Button>
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
          class="w-32"
        />
        <span class="text-white text-xs w-12 text-right">{wavelengthVariation.toFixed(2)}</span>
        <Button 
          onclick={onResetWavelengthVariation}
          variant="outline"
          class="w-6 h-6 p-0 text-xs bg-transparent border-white border-opacity-30 hover:bg-white hover:bg-opacity-10"
          title="Reset to default"
        >
          ↺
        </Button>
      </div>
    {/if}
  </div>
  
  <div>
    <div class="flex items-center space-x-2">
      <Switch id="freq" bind:checked={freqToggle} />
      <Label for="freq" class="text-white w-24">Frequency</Label>
      <Slider 
        bind:value={frequency} 
        min={FREQUENCY_RANGE.min} 
        max={FREQUENCY_RANGE.max} 
        step={FREQUENCY_RANGE.step}
        class="w-32"
      />
      {#if nerdMode}
        <span class="text-white text-xs w-12 text-right">{frequency.toFixed(2)}</span>
        <Button 
          onclick={onResetFrequency}
          variant="outline"
          class="w-6 h-6 p-0 text-xs bg-transparent border-white border-opacity-30 hover:bg-white hover:bg-opacity-10"
          title="Reset to default"
        >
          ↺
        </Button>
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
          class="w-32"
        />
        <span class="text-white text-xs w-12 text-right">{frequencyVariation.toFixed(2)}</span>
        <Button 
          onclick={onResetFrequencyVariation}
          variant="outline"
          class="w-6 h-6 p-0 text-xs bg-transparent border-white border-opacity-30 hover:bg-white hover:bg-opacity-10"
          title="Reset to default"
        >
          ↺
        </Button>
      </div>
    {/if}
  </div>
  
  <div>
    <div class="flex items-center space-x-2">
      <Switch id="per" bind:checked={perToggle} />
      <Label for="per" class="text-white w-24">Period</Label>
      <Slider 
        bind:value={period} 
        min={PERIOD_RANGE.min} 
        max={PERIOD_RANGE.max} 
        step={PERIOD_RANGE.step}
        class="w-32"
      />
      {#if nerdMode}
        <span class="text-white text-xs w-12 text-right">{period.toFixed(3)}</span>
        <Button 
          onclick={onResetPeriod}
          variant="outline"
          class="w-6 h-6 p-0 text-xs bg-transparent border-white border-opacity-30 hover:bg-white hover:bg-opacity-10"
          title="Reset to default"
        >
          ↺
        </Button>
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
          class="w-32"
        />
        <span class="text-white text-xs w-12 text-right">{periodVariation.toFixed(2)}</span>
        <Button 
          onclick={onResetPeriodVariation}
          variant="outline"
          class="w-6 h-6 p-0 text-xs bg-transparent border-white border-opacity-30 hover:bg-white hover:bg-opacity-10"
          title="Reset to default"
        >
          ↺
        </Button>
      </div>
    {/if}
  </div>
  
  <div>
    <div class="flex items-center space-x-2">
      <Switch id="spacing" bind:checked={spacingToggle} />
      <Label for="spacing" class="text-white w-24">Spacing</Label>
      <Slider 
        bind:value={spacing} 
        min={SPACING_RANGE.min} 
        max={SPACING_RANGE.max} 
        step={SPACING_RANGE.step}
        class="w-32"
      />
      {#if nerdMode}
        <span class="text-white text-xs w-12 text-right">{spacing.toFixed(2)}</span>
        <Button 
          onclick={onResetSpacing}
          variant="outline"
          class="w-6 h-6 p-0 text-xs bg-transparent border-white border-opacity-30 hover:bg-white hover:bg-opacity-10"
          title="Reset to default"
        >
          ↺
        </Button>
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
          class="w-32"
        />
        <span class="text-white text-xs w-12 text-right">{spacingVariation.toFixed(2)}</span>
        <Button 
          onclick={onResetSpacingVariation}
          variant="outline"
          class="w-6 h-6 p-0 text-xs bg-transparent border-white border-opacity-30 hover:bg-white hover:bg-opacity-10"
          title="Reset to default"
        >
          ↺
        </Button>
      </div>
    {/if}
  </div>
  
  <div>
    <div class="flex items-center space-x-2">
      <Switch id="waveCount" bind:checked={waveCountToggle} />
      <Label for="waveCount" class="text-white w-24">Wave Count</Label>
      <Slider 
        bind:value={waveCount} 
        min={WAVE_COUNT_RANGE.min} 
        max={WAVE_COUNT_RANGE.max} 
        step={WAVE_COUNT_RANGE.step}
        class="w-32"
      />
      {#if nerdMode}
        <span class="text-white text-xs w-12 text-right">{waveCount}</span>
        <Button 
          onclick={onResetWaveCount}
          variant="outline"
          class="w-6 h-6 p-0 text-xs bg-transparent border-white border-opacity-30 hover:bg-white hover:bg-opacity-10"
          title="Reset to default"
        >
          ↺
        </Button>
      {/if}
    </div>
  </div>
</div>
