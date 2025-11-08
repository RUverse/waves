<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Switch } from '$lib/components/ui/switch';
  import { Label } from '$lib/components/ui/label';
  import { Slider } from '$lib/components/ui/slider';
  import { ColorPicker } from '$lib/components/ui/color-picker';
  import Actions from './Actions.svelte';
  import ConfigTabs from './ConfigTabs.svelte';
  import Configurations from './Configurations.svelte';
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
  export let spacing: number;
  export let waveCount: number;
  export let ampToggle: boolean;
  export let waveToggle: boolean;
  export let freqToggle: boolean;
  export let perToggle: boolean;
  export let spacingToggle: boolean;
  export let waveCountToggle: boolean;
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
  export let spacingVariation: number;
  export let onResetAmplitudeVariation: () => void;
  export let onResetWavelengthVariation: () => void;
  export let onResetFrequencyVariation: () => void;
  export let onResetPeriodVariation: () => void;
  export let onResetSpacingVariation: () => void;
</script>

<!-- Control Panel with Config Tabs -->
<div class="absolute bottom-1 left-1 flex items-end gap-2">
  <!-- Menu Button (only shown when panel is hidden) -->
  {#if !showPanel}
    <Button 
      onclick={onTogglePanel}
      class="w-10 h-10 p-0 m-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white border border-white border-opacity-30 flex items-center justify-center transition-all"
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
    <div class="control-panel flex flex-col rounded bg-black bg-opacity-80 p-2 m-0 gap-2">
      <!-- Header -->
      <h2 class="text-white text-sm font-semibold tracking-wider uppercase opacity-70">waves</h2>

      <!-- Main Layout: Actions (Left) and Content (Right) -->
      <div class="flex flex-row gap-2">
        <!-- Left Sidebar - Actions Buttons (Vertical) -->
        <div class="flex flex-col justify-between gap-2">
          <Actions {onReset} {onResetConfig} {onSaveConfig} {onSaveConfigAsNew} {onOpenSettings} {onOpenExport} {activeWaveId} />
          
          <!-- Collapse Button (at bottom) -->
          <Button 
            onclick={onTogglePanel}
            variant="outline"
            class="bg-black opacity-70 text-white w-10 h-10 p-0 flex items-center justify-center"
            title="Collapse panel"
          >
            <!-- Chevron Left Icon -->
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polyline points="13,5 8,10 13,15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            </svg>
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
      bind:spacing
      bind:waveCount
      bind:ampToggle
      bind:waveToggle
      bind:freqToggle
      bind:perToggle
      bind:spacingToggle
      bind:waveCountToggle
      bind:amplitudeVariation
      bind:wavelengthVariation
      bind:frequencyVariation
      bind:periodVariation
      bind:spacingVariation
      {nerdMode}
      {onResetAmplitude}
      {onResetWavelength}
      {onResetFrequency}
      {onResetPeriod}
      {onResetSpacing}
      {onResetWaveCount}
      {onResetAmplitudeVariation}
      {onResetWavelengthVariation}
      {onResetFrequencyVariation}
      {onResetPeriodVariation}
      {onResetSpacingVariation}
    />

    <!-- Color Pickers -->
    <div class="flex items-center space-x-2 pt-2 border-t border-white border-opacity-20">
      <ColorPicker 
        label="Wave" 
        bind:value={waveColor} 
        onChange={(color) => waveColor = color}
      />
      {#if nerdMode}
        <Button 
          onclick={onResetWaveColor}
          variant="outline"
          class="w-6 h-6 p-0 text-xs bg-transparent border-white border-opacity-30 hover:bg-white hover:bg-opacity-10"
          title="Reset to default"
        >
          ↺
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
      </div>
    </div>
  {/if}
</div>

<style>
  /* View transition names for animated elements */
  :global(.control-panel) {
    view-transition-name: control-panel;
  }

  /* Slide animation for the panel */
  @keyframes slide-out {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(-120%);
    }
  }

  @keyframes slide-in {
    from {
      transform: translateX(-120%);
    }
    to {
      transform: translateX(0);
    }
  }

  /* Apply animations to view transitions */
  :global(::view-transition-old(control-panel)) {
    animation: 0.3s ease-out both slide-out;
  }

  :global(::view-transition-new(control-panel)) {
    animation: 0.3s ease-out both slide-in;
  }
</style>
