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
  export let spacing: number;
  export let waveCount: number;
  export let onReset: () => void;
  export let onResetConfig: () => void;
  export let onSaveConfig: () => void;
  export let onSaveConfigAsNew: () => void;
  export let onTogglePanel: () => void;
  export let onOpenSettings: () => void;
  export let onOpenExport: () => void;
  export let nerdMode: boolean;
  export let onResetAmplitude: () => void;
  export let onResetWavelength: () => void;
  export let onResetFrequency: () => void;
  export let onResetPeriod: () => void;
  export let onResetRotation: () => void;
  export let onResetSpacing: () => void;
  export let onResetWaveCount: () => void;
  export let onResetWaveColor: () => void;
  export let onResetBackgroundColor: () => void;
  export let waveColor: string;
  export let backgroundColor: string;
  export let amplitudeVariation: number;
  export let wavelengthVariation: number;
  export let frequencyVariation: number;
  export let periodVariation: number;
  export let rotationVariation: number;
  export let spacingVariation: number;
  export let onResetAmplitudeVariation: () => void;
  export let onResetWavelengthVariation: () => void;
  export let onResetFrequencyVariation: () => void;
  export let onResetPeriodVariation: () => void;
  export let onResetRotationVariation: () => void;
  export let onResetSpacingVariation: () => void;
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
      class="control-panel glass-surface flex flex-col rounded-2xl p-3 m-0 gap-3"
      transition:fly={{ x: -24, duration: 260, easing: cubicOut }}
    >
      <!-- Header -->
      <h2 class="text-white/60 text-xs font-semibold tracking-[0.2em] uppercase px-1">waves</h2>

      <!-- Main Layout: Actions (Left) and Content (Right) -->
      <div class="flex flex-row gap-2">
        <!-- Left Sidebar - Actions Buttons (Vertical) -->
        <div class="flex flex-col justify-between gap-2 w-32 shrink-0">
          <Actions {onReset} {onResetConfig} {onSaveConfig} {onSaveConfigAsNew} {onOpenSettings} {onOpenExport} {activeWaveId} />
          
          <!-- Collapse Button (at bottom) -->
          <Button
            onclick={onTogglePanel}
            variant="ghost"
            class="glass-btn flex items-center justify-start gap-2.5 w-full h-10 px-3 rounded-lg text-sm font-medium"
            title="Collapse panel"
          >
            <!-- Chevron Left Icon -->
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polyline points="13,5 8,10 13,15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            </svg>
            <span>Collapse</span>
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
      bind:spacing
      bind:waveCount
      bind:amplitudeVariation
      bind:wavelengthVariation
      bind:frequencyVariation
      bind:periodVariation
      bind:rotationVariation
      bind:spacingVariation
      {nerdMode}
      {onResetAmplitude}
      {onResetWavelength}
      {onResetFrequency}
      {onResetPeriod}
      {onResetRotation}
      {onResetSpacing}
      {onResetWaveCount}
      {onResetAmplitudeVariation}
      {onResetWavelengthVariation}
      {onResetFrequencyVariation}
      {onResetPeriodVariation}
      {onResetRotationVariation}
      {onResetSpacingVariation}
    />

    <!-- Color Pickers -->
    <div class="flex items-center space-x-2 pt-3 border-t border-white/10">
      <ColorPicker
        label="Wave"
        bind:value={waveColor}
        onChange={(color) => waveColor = color}
      />
      {#if nerdMode}
        <Button
          onclick={onResetWaveColor}
          variant="ghost"
          class="glass-btn w-6 h-6 p-0 rounded-md flex items-center justify-center"
          title="Reset to default"
        >
          <ResetIcon />
        </Button>
      {/if}
      <div class="mx-2"></div>
      <ColorPicker
        label="Background"
        bind:value={backgroundColor}
        onChange={(color) => backgroundColor = color}
      />
      {#if nerdMode}
        <Button
          onclick={onResetBackgroundColor}
          variant="ghost"
          class="glass-btn w-6 h-6 p-0 rounded-md flex items-center justify-center"
          title="Reset to default"
        >
          <ResetIcon />
        </Button>
      {/if}
    </div>
        </div>
        </div>
      </div>
    </div>
  {/if}
</div>
