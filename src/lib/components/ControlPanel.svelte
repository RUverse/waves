<script lang="ts">
  import { fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { Button } from '$lib/components/ui/button';
  import { ColorPicker } from '$lib/components/ui/color-picker';
  import Actions from './Actions.svelte';
  import ConfigTabs from './ConfigTabs.svelte';
  import Configurations from './Configurations.svelte';
  import ModeToggle from './ModeToggle.svelte';
  import ResetIcon from './ResetIcon.svelte';
  import SidebarControls from './SidebarControls.svelte';
  import type { Wave } from '$lib/configStorage';
  import {
    DEFAULT_AMPLITUDE,
    DEFAULT_WAVELENGTH,
    DEFAULT_FREQUENCY,
    DEFAULT_PERIOD,
    DEFAULT_ROTATION,
    DEFAULT_CURVATURE,
    DEFAULT_GLITCH,
    DEFAULT_SPACING,
    DEFAULT_THICKNESS,
    DEFAULT_TAPER,
    DEFAULT_WAVE_COUNT,
    DEFAULT_AMPLITUDE_VARIATION,
    DEFAULT_WAVELENGTH_VARIATION,
    DEFAULT_FREQUENCY_VARIATION,
    DEFAULT_PERIOD_VARIATION,
    DEFAULT_ROTATION_VARIATION,
    DEFAULT_CURVATURE_VARIATION,
    DEFAULT_SPACING_VARIATION,
    DEFAULT_THICKNESS_VARIATION,
    DEFAULT_WAVE_COLOR,
    DEFAULT_BACKGROUND_COLOR
  } from '$lib/constants';

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
  export let glitch: number;
  export let spacing: number;
  export let thickness: number;
  export let taper: number;
  export let waveCount: number;
  export let onReset: () => void;
  export let onResetConfig: () => void;
  export let onSaveConfig: () => void;
  export let onSaveConfigAsNew: () => void;
  export let onTogglePanel: () => void;
  export let onOpenExport: () => void;
  export let nerdMode: boolean;
  export let onToggleNerdMode: (value: boolean) => void;
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
  export let onResetWaveColor: () => void;
  export let onResetBackgroundColor: () => void;
  export let waveColor: string;
  export let backgroundColor: string;

  $: waveColorAtDefault = normColor(waveColor) === normColor(DEFAULT_WAVE_COLOR);
  $: backgroundColorAtDefault = normColor(backgroundColor) === normColor(DEFAULT_BACKGROUND_COLOR);
  $: colorsAtDefault = waveColorAtDefault && backgroundColorAtDefault;

  $: allSettingsAtDefault =
    amplitude === DEFAULT_AMPLITUDE &&
    wavelength === DEFAULT_WAVELENGTH &&
    frequency === DEFAULT_FREQUENCY &&
    period === DEFAULT_PERIOD &&
    rotation === DEFAULT_ROTATION &&
    curvature === DEFAULT_CURVATURE &&
    glitch === DEFAULT_GLITCH &&
    spacing === DEFAULT_SPACING &&
    thickness === DEFAULT_THICKNESS &&
    taper === DEFAULT_TAPER &&
    waveCount === DEFAULT_WAVE_COUNT &&
    amplitudeVariation === DEFAULT_AMPLITUDE_VARIATION &&
    wavelengthVariation === DEFAULT_WAVELENGTH_VARIATION &&
    frequencyVariation === DEFAULT_FREQUENCY_VARIATION &&
    periodVariation === DEFAULT_PERIOD_VARIATION &&
    rotationVariation === DEFAULT_ROTATION_VARIATION &&
    curvatureVariation === DEFAULT_CURVATURE_VARIATION &&
    spacingVariation === DEFAULT_SPACING_VARIATION &&
    thicknessVariation === DEFAULT_THICKNESS_VARIATION &&
    colorsAtDefault;

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
<div class="absolute bottom-[max(0.25rem,env(safe-area-inset-bottom))] left-[max(0.25rem,env(safe-area-inset-left))] grid items-end">
  <!-- Menu Button (only shown when panel is hidden) -->
  {#if !showPanel}
    <Button
      onclick={onTogglePanel}
      variant="ghost"
      class="glass-btn col-start-1 row-start-1 w-10 h-10 p-0 m-2 rounded-xl flex items-center justify-center"
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
      class="control-panel glass-surface col-start-1 row-start-1 flex flex-row rounded-2xl p-3 m-0 gap-3 w-[calc(100vw-0.5rem-env(safe-area-inset-left)-env(safe-area-inset-right))] sm:w-auto max-w-[calc(100vw-0.5rem-env(safe-area-inset-left)-env(safe-area-inset-right))] max-h-[calc(100dvh-0.5rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] overflow-hidden"
      transition:fly={{ x: -24, duration: 260, easing: cubicOut }}
    >
      <!-- Left Sidebar: saved configs, collapse pinned at bottom -->
      <div class="flex flex-col gap-2 w-16 sm:w-40 shrink-0">
        <header class="px-1 py-1">
          <h1 class="text-white/70 text-xs font-semibold tracking-[0.2em] uppercase">Waves</h1>
          <p class="hidden sm:block mt-1.5 text-[10px] leading-relaxed text-white/45">
            Generate animated wave patterns and embed them in your website.
          </p>
        </header>

        <ModeToggle {nerdMode} {onToggleNerdMode} />

        <div class="flex flex-col gap-2 min-h-0 overflow-y-auto">
          <ConfigTabs
            waves={savedWaves}
            activeWaveId={activeWaveId}
            {hasUnsavedChanges}
            onSelectWave={onSelectWave}
            onDeleteWave={onDeleteWave}
          />
        </div>

        {#if activeWaveId && hasUnsavedChanges}
          <Button
            onclick={onSaveConfigAsNew}
            variant="ghost"
            class="glass-btn flex items-center justify-center gap-1.5 h-9 px-2 rounded-lg"
            title="Save as new config"
          >
            <!-- Save as new icon (save with plus) -->
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 14H4C3.44772 14 3 13.5523 3 13V3C3 2.44772 3.44772 2 4 2H9L13 6V13C13 13.5523 12.5523 14 12 14Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M10 2V6H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M8 8V12M6 10H10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <span class="hidden sm:inline text-[10px] leading-none font-light opacity-75">Save as new</span>
          </Button>
        {/if}

        <div class="flex-1"></div>

        <SidebarControls onHidePanel={onTogglePanel} />
      </div>

      <!-- Divider -->
      <div class="w-px bg-white/10 self-stretch"></div>

      <!-- Main Content Area -->
      <div class="flex-1 sm:flex-none min-w-0 flex flex-col gap-3 min-h-0 overflow-y-auto">
        <!-- Top action bar -->
        <Actions
          {onReset}
          {onResetConfig}
          {onSaveConfig}
          {onOpenExport}
          {activeWaveId}
          {hasUnsavedChanges}
          resetDisabled={allSettingsAtDefault}
        />

    <Configurations
      bind:amplitude
      bind:wavelength
      bind:frequency
      bind:period
      bind:rotation
      bind:curvature
      bind:glitch
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
      {onResetGlitch}
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
        <div class="flex items-center gap-2">
          <Button
            onclick={resetColors}
            disabled={colorsAtDefault}
            variant="ghost"
            class="glass-btn w-7 h-7 p-0 rounded-lg flex items-center justify-center shrink-0"
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
  {/if}
</div>
