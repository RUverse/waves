<script lang="ts">
  import { Button } from '$lib/components/ui/button';

  export let onReset: () => void;
  export let onResetConfig: () => void;
  export let onOpenExport: () => void;
  export let nerdMode: boolean;
  export let onToggleNerdMode: (value: boolean) => void;

  const iconBtnClass =
    'glass-btn flex flex-col items-center justify-center gap-0.5 w-10 h-10 sm:w-11 sm:h-11 p-0 rounded-lg';
</script>

<!-- Top action bar: Reset + Shuffle (left), Core/Pro switch (center), Share (right) -->
<div class="flex items-center justify-between gap-2">
  <div class="flex items-center gap-2">
    <Button onclick={onResetConfig} variant="ghost" class={iconBtnClass} title="Reset all settings to defaults">
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

  <!-- Core / Pro segmented switch -->
  <div class="flex items-center rounded-full border border-white/20 bg-white/5 p-0.5" role="radiogroup" aria-label="Mode">
    <button
      role="radio"
      aria-checked={!nerdMode}
      onclick={() => onToggleNerdMode(false)}
      class="px-2 sm:px-2.5 py-1 rounded-full text-xs font-medium transition-colors {!nerdMode ? 'bg-white/25 text-white' : 'text-white/55 hover:text-white'}"
    >
      Core
    </button>
    <button
      role="radio"
      aria-checked={nerdMode}
      onclick={() => onToggleNerdMode(true)}
      class="px-2 sm:px-2.5 py-1 rounded-full text-xs font-medium transition-colors {nerdMode ? 'bg-white/25 text-white' : 'text-white/55 hover:text-white'}"
    >
      Pro
    </button>
  </div>

  <Button onclick={onOpenExport} variant="ghost" class={iconBtnClass} title="Share / export">
    <!-- Share icon (arrow out of tray) -->
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 10V2M8 2L5 5M8 2L11 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M3 9V13C3 13.5523 3.44772 14 4 14H12C12.5523 14 13 13.5523 13 13V9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <span class="text-[10px] leading-none font-light opacity-75">Share</span>
  </Button>
</div>
