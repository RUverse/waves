<script lang="ts">
  import type { Wave } from '$lib/configStorage';

  export let waves: Wave[];
  export let activeWaveId: string | null;
  export let hasUnsavedChanges: boolean;
  export let onSelectWave: (wave: Wave) => void;
  export let onDeleteWave: (id: string) => void;
</script>

{#if waves.length > 0}
  <div class="flex flex-col gap-2">
    {#each waves as wave (wave.id)}
      <div
        class="glass-btn relative flex items-center justify-center h-9 px-4 sm:px-7 rounded-lg text-xs cursor-pointer {activeWaveId === wave.id ? 'is-active' : ''}"
        title={`${wave.name} - ${new Date(wave.timestamp).toLocaleString()}`}
        onclick={() => onSelectWave(wave)}
        onkeydown={(e) => e.key === 'Enter' && onSelectWave(wave)}
        role="button"
        tabindex="0"
      >
        <!-- Unsaved changes indicator -->
        {#if activeWaveId === wave.id && hasUnsavedChanges}
          <span class="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-yellow-400 rounded-full"></span>
        {/if}

        <span class="truncate {activeWaveId === wave.id ? 'font-bold' : ''}">{wave.name}</span>

        <!-- Delete button -->
        <button
          onclick={(e) => {
            e.stopPropagation();
            onDeleteWave(wave.id);
          }}
          class="absolute right-1.5 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-white/50 hover:text-red-400 transition-colors"
          title="Delete wave"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="2" y1="2" x2="10" y2="10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="10" y1="2" x2="2" y2="10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    {/each}
  </div>
{/if}
