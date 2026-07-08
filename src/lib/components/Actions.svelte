<script lang="ts">
  import { Button } from '$lib/components/ui/button';

  export let onReset: () => void;
  export let onResetConfig: () => void;
  export let onSaveConfig: () => void;
  export let onSaveConfigAsNew: () => void;
  export let onOpenSettings: () => void;
  export let onOpenExport: () => void;
  export let activeWaveId: string | null;

  const btnClass =
    'glass-btn flex items-center justify-start gap-2.5 w-full h-10 px-3 rounded-lg text-sm font-medium';
</script>

<div class="flex flex-col gap-2">
  <Button onclick={onReset} variant="ghost" class={btnClass} title="Reset Seed">
    <!-- Shuffle/Random icon -->
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 3L10 3M13 3L13 6M13 3L9.5 6.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M13 13L10 13M13 13L13 10M13 13L9.5 9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M3 3L6.5 6.5M3 13L6.5 9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <span class="text-xs">Reset Seed</span>
  </Button>
  <Button onclick={onResetConfig} variant="ghost" class={btnClass} title="Reset Config">
    <!-- Rotate/Reset icon -->
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 8C13 10.7614 10.7614 13 8 13C5.23858 13 3 10.7614 3 8C3 5.23858 5.23858 3 8 3C9.86 3 11.4285 4.07 12.2 5.6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M11 3H13V5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <span class="text-xs">Reset Config</span>
  </Button>
  <Button onclick={onSaveConfig} variant="ghost" class={btnClass} title="Save config">
    <!-- Save icon -->
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 14H4C3.44772 14 3 13.5523 3 13V3C3 2.44772 3.44772 2 4 2H9L13 6V13C13 13.5523 12.5523 14 12 14Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M10 2V6H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M6 10H10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
    <span class="text-xs">Save</span>
  </Button>
  {#if activeWaveId}
    <Button onclick={onSaveConfigAsNew} variant="ghost" class={btnClass} title="Save as new config">
      <!-- Save as new icon (save with plus) -->
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 14H4C3.44772 14 3 13.5523 3 13V3C3 2.44772 3.44772 2 4 2H9L13 6V13C13 13.5523 12.5523 14 12 14Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M10 2V6H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M8 8V12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M6 10H10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
      <span class="text-xs">Save as New</span>
    </Button>
  {/if}
  <Button onclick={onOpenSettings} variant="ghost" class={btnClass} title="Settings">
    <!-- Settings icon (gear) -->
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M13.5 8C13.5 8.3 13.5 8.5 13.4 8.8L14.8 9.9C14.9 10 14.9 10.2 14.8 10.3L13.5 12.7C13.4 12.8 13.2 12.9 13.1 12.8L11.4 12.1C11.1 12.3 10.8 12.5 10.5 12.6L10.2 14.4C10.2 14.5 10.1 14.6 9.9 14.6H7.3C7.1 14.6 7 14.5 7 14.4L6.7 12.6C6.4 12.5 6.1 12.3 5.8 12.1L4.1 12.8C4 12.9 3.8 12.8 3.7 12.7L2.4 10.3C2.3 10.2 2.3 10 2.4 9.9L3.8 8.8C3.8 8.5 3.8 8.3 3.8 8C3.8 7.7 3.8 7.5 3.8 7.2L2.4 6.1C2.3 6 2.3 5.8 2.4 5.7L3.7 3.3C3.8 3.2 4 3.1 4.1 3.2L5.8 3.9C6.1 3.7 6.4 3.5 6.7 3.4L7 1.6C7 1.5 7.1 1.4 7.3 1.4H9.9C10.1 1.4 10.2 1.5 10.2 1.6L10.5 3.4C10.8 3.5 11.1 3.7 11.4 3.9L13.1 3.2C13.2 3.1 13.4 3.2 13.5 3.3L14.8 5.7C14.9 5.8 14.9 6 14.8 6.1L13.4 7.2C13.5 7.5 13.5 7.7 13.5 8Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <span class="text-xs">Settings</span>
  </Button>
  <Button onclick={onOpenExport} variant="ghost" class={btnClass} title="Export">
    <!-- Export icon (download/arrow down) -->
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 2V11M8 11L5 8M8 11L11 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M14 11V13C14 13.5523 13.5523 14 13 14H3C2.44772 14 2 13.5523 2 13V11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <span class="text-xs">Export</span>
  </Button>
</div>
