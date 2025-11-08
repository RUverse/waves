<script lang="ts">
  import type { Wave } from '$lib/configStorage';

  export let waves: Wave[];
  export let activeWaveId: string | null;
  export let hasUnsavedChanges: boolean;
  export let onSelectWave: (wave: Wave) => void;
  export let onDeleteWave: (id: string) => void;
</script>

{#if waves.length > 0}
  <div class="flex flex-wrap gap-2 max-w-md">
    {#each waves as wave (wave.id)}
      <div
        class="relative px-3 py-2 pr-6 rounded text-xs bg-black bg-opacity-80 text-white border border-white border-opacity-30 hover:border-opacity-50 transition-all cursor-pointer {activeWaveId === wave.id ? 'border-white border-opacity-70' : ''}"
        title={`${wave.name} - ${new Date(wave.timestamp).toLocaleString()}`}
        onclick={() => onSelectWave(wave)}
        onkeydown={(e) => e.key === 'Enter' && onSelectWave(wave)}
        role="button"
        tabindex="0"
      >
        <span class="{activeWaveId === wave.id ? 'font-bold' : ''}">{wave.name}</span>
        
        <!-- Unsaved changes indicator -->
        {#if activeWaveId === wave.id && hasUnsavedChanges}
          <span class="absolute top-1 right-6 w-2 h-2 bg-yellow-400 rounded-full"></span>
        {/if}
        
        <!-- Delete button -->
        <button
          onclick={(e) => {
            e.stopPropagation();
            onDeleteWave(wave.id);
          }}
          class="absolute top-1 right-1 w-4 h-4 flex items-center justify-center text-white hover:text-red-400 transition-colors"
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
