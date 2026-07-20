<script lang="ts">
  import { fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { Button } from '$lib/components/ui/button';
  import { Label } from '$lib/components/ui/label';
  import { Slider } from '$lib/components/ui/slider';
  import { ColorPicker } from '$lib/components/ui/color-picker';
  import Actions from './Actions.svelte';
  import ConfigTabs from './ConfigTabs.svelte';
  import Configurations from './Configurations.svelte';
  import ResetIcon from './ResetIcon.svelte';
  import type { Wave } from '$lib/configStorage';
  import { DEFAULT_WAVE_COLOR, DEFAULT_BACKGROUND_COLOR } from '$lib/constants';

  // Normalize a color to lowercase 8-digit hex so #ffffff and #ffffffff compare
  // equal when deciding whether a color reset is already at its default.
  function normColor(c: string): string {
    let s = (c || '').trim().toLowerCase();
    if (s[0] === '#') s = s.slice(1);
    if (s.length === 3) s = s.split('').map((ch) => ch + ch).join('');
    if (s.length === 6) s += 'ff';
    return s;
  }

  // Props
  export let showPanel: boolean;
  export let savedWaves: Wave[];
  export let activeWaveId: string | null;
  export let hasUnsavedChanges: boolean;
  export let onSelectWave: (wave: Wave) => void;
  export let onDeleteWave: (id: string) => void;
  export let amplitude: number;
  export let wavelength: number;
  export let frequency: number;
  export let period: number;
  export let rotation: number;
  export let curvature: number;
  export let spacing: number;
  export let thickness: number;
  export let taper: number;
  export let waveCount: number;
  export let onReset: () => void;
  export let onResetConfig: () => void;
  export let onSaveConfig: () => void;
  export let onSaveConfigAsNew: () => void;
  export let onTogglePanel: () => void;
  export let onOpenSettings: () => void;
  export let onOpenExport: () => void;
  export let nerdMode: boolean;
  export let onToggleNerdMode: (value: boolean) => void;
  export let onResetAmplitude: () => void;
  export let onResetWavelength: () => void;
  export let onResetFrequency: () => void;
  export let onResetPeriod: () => void;
  export let onResetRotation: () => void;
  export let onResetCurvature: () => void;
  export let onResetSpacing: () => void;
  export let onResetThickness: () => void;
  export let onResetTaper: () => void;
  export let onResetWaveCount: () => void;
  export let onResetWaveColor: () => void;
  export let onResetBackgroundColor: () => void;
  export let waveColor: string;
  export let backgroundColor: string;

  $: waveColorAtDefault = normColor(waveColor) === normColor(DEFAULT_WAVE_COLOR);
  $: backgroundColorAtDefault = normColor(backgroundColor) === normColor(DEFAULT_BACKGROUND_COLOR);
  $: colorsAtDefault = waveColorAtDefault && backgroundColorAtDefault;

  function resetColors() {
    onResetWaveColor();
    onResetBackgroundColor();
  }

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

<!-- Control Panel with Config Tabs -->
<div class="absolute bottom-1 left-1 flex items-end gap-2">
  <!-- Menu Button (only shown when panel is hidden) -->
  {#if !showPanel}
    <Button
      onclick={onTogglePanel}
      variant="ghost"
      class="glass-btn w-10 h-10 p-0 m-2 rounded-xl flex items-center justify-center"
      title="Open panel"
    >
      <!-- Hamburger Menu Icon -->
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="4" y1="6" x2="16" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <line x1="4" y1="10" x2="16" y2="10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <line x1="4" y1="14" x2="16" y2="14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </Button>
  {/if}

  <!-- Control Panel -->
  {#if showPanel}
    <div
      class="control-panel glass-surface flex flex-col rounded-2xl p-3 m-0 gap-3 max-w-[calc(100vw-0.5rem)] max-h-[calc(100dvh-0.5rem)] overflow-y-auto overflow-x-hidden"
      transition:fly={{ x: -24, duration: 260, easing: cubicOut }}
    >
      <!-- Header -->
      <h2 class="text-white/60 text-xs font-semibold tracking-[0.2em] uppercase px-1">waves</h2>

      <!-- Main Layout: Actions (Left) and Content (Right) -->
      <div class="flex flex-row gap-2">
        <!-- Left Sidebar - Actions Buttons (Vertical) -->
        <div class="flex flex-col justify-between gap-2 w-11 sm:w-32 shrink-0">
          <Actions {onReset} {onResetConfig} {onSaveConfig} {onSaveConfigAsNew} {onOpenSettings} {onOpenExport} {activeWaveId} {nerdMode} {onToggleNerdMode} />
          
          <!-- Collapse Button (at bottom) -->
          <Button
            onclick={onTogglePanel}
            variant="ghost"
            class="glass-btn flex items-center justify-center sm:justify-start gap-2.5 w-full h-10 px-0 sm:px-3 rounded-lg text-sm font-medium"
            title="Collapse panel"
          >
            <!-- Chevron Left Icon -->
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polyline points="13,5 8,10 13,15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            </svg>
            <span class="hidden sm:inline">Collapse</span>
          </Button>
        </div>

        <!-- Main Content Area -->
        <div class="flex flex-col">
        
        <!-- Config Tabs -->
        <div class="mb-2">
          <ConfigTabs 
            waves={savedWaves}
            activeWaveId={activeWaveId}
            {hasUnsavedChanges}
            onSelectWave={onSelectWave}
            onDeleteWave={onDeleteWave}
          />
        </div>
        
        <div class="flex flex-col gap-3">
    
    <Configurations
      bind:amplitude
      bind:wavelength
      bind:frequency
      bind:period
      bind:rotation
      bind:curvature
      bind:spacing
      bind:thickness
      bind:taper
      bind:waveCount
      bind:amplitudeVariation
      bind:wavelengthVariation
      bind:frequencyVariation
      bind:periodVariation
      bind:rotationVariation
      bind:curvatureVariation
      bind:spacingVariation
      bind:thicknessVariation
      {nerdMode}
      {onResetAmplitude}
      {onResetWavelength}
      {onResetFrequency}
      {onResetPeriod}
      {onResetRotation}
      {onResetCurvature}
      {onResetSpacing}
      {onResetThickness}
      {onResetTaper}
      {onResetWaveCount}
      {onResetAmplitudeVariation}
      {onResetWavelengthVariation}
      {onResetFrequencyVariation}
      {onResetPeriodVariation}
      {onResetRotationVariation}
      {onResetCurvatureVariation}
      {onResetSpacingVariation}
      {onResetThicknessVariation}
    />

    <!-- Colors row: one reset on the left resets both wave + background -->
    <div class="flex items-center space-x-2">
      <Button
        onclick={resetColors}
        disabled={colorsAtDefault}
        variant="ghost"
        class="glass-btn w-6 h-6 p-0 rounded-md flex items-center justify-center shrink-0"
        title={colorsAtDefault ? 'Colors are at default' : 'Reset colors'}
      >
        <ResetIcon />
      </Button>
      <ColorPicker
        label="Wave"
        bind:value={waveColor}
        onChange={(color) => waveColor = color}
      />
      <div class="mx-1"></div>
      <ColorPicker
        label="Background"
        bind:value={backgroundColor}
        onChange={(color) => backgroundColor = color}
      />
    </div>
        </div>
        </div>
      </div>
    </div>
  {/if}
</div>
