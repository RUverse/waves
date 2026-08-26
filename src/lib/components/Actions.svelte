<script lang="ts">
  import { Button } from '$lib/components/ui/button';

  export let onReset: () => void;
  export let onResetConfig: () => void;
  export let onSaveConfig: () => void;
  export let onOpenShare: () => void;
  export let activeWaveId: string | null;
  export let hasUnsavedChanges: boolean;
  export let resetDisabled: boolean = false;

  const iconBtnClass =
    'glass-btn flex flex-col items-center justify-center gap-0.5 w-10 h-10 sm:w-11 sm:h-11 p-0 rounded-lg';
</script>

<!-- Top action bar: Reset + Shuffle (left), contextual Save + Share (right) -->
<div class="flex items-center justify-between gap-2">
  <div class="flex items-center gap-2">
    <Button
      onclick={onResetConfig}
      disabled={resetDisabled}
      variant="ghost"
      class={iconBtnClass}
      title={resetDisabled ? 'All settings are at default' : 'Reset all settings to defaults'}
    >
      <!-- Rotate/Reset icon -->
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 8C13 10.7614 10.7614 13 8 13C5.23858 13 3 10.7614 3 8C3 5.23858 5.23858 3 8 3C9.86 3 11.4285 4.07 12.2 5.6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M11 3H13V5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span class="text-[10px] leading-none font-light opacity-75">Reset</span>
    </Button>
    <Button onclick={onReset} variant="ghost" class={iconBtnClass} title="Shuffle: randomize the wave">
      <!-- Shuffle icon -->
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 3L10 3M13 3L13 6M13 3L9.5 6.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M13 13L10 13M13 13L13 10M13 13L9.5 9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M3 3L6.5 6.5M3 13L6.5 9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span class="text-[10px] leading-none font-light opacity-75">Shuffle</span>
    </Button>
  </div>

  <div class="flex items-center gap-2">
    {#if !activeWaveId || hasUnsavedChanges}
      <Button onclick={onSaveConfig} variant="ghost" class={iconBtnClass} title="Save config">
        <!-- Save icon -->
        <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 14H4C3.44772 14 3 13.5523 3 13V3C3 2.44772 3.44772 2 4 2H9L13 6V13C13 13.5523 12.5523 14 12 14Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M10 2V6H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M6 10H10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <span class="text-[10px] leading-none font-light opacity-75">Save</span>
      </Button>
    {/if}

    <Button onclick={onOpenShare} variant="ghost" class={iconBtnClass} title="Share">
      <!-- Share icon -->
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="4" cy="8" r="1.75" stroke="currentColor" stroke-width="1.5"/>
        <circle cx="11.5" cy="3.5" r="1.75" stroke="currentColor" stroke-width="1.5"/>
        <circle cx="11.5" cy="12.5" r="1.75" stroke="currentColor" stroke-width="1.5"/>
        <path d="M5.5 7.1 10 4.4M5.5 8.9 10 11.6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
      <span class="text-[10px] leading-none font-light opacity-75">Share</span>
    </Button>
  </div>
</div>
