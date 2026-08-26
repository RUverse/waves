<script lang="ts">
  export let nerdMode: boolean;
  export let onToggleNerdMode: (value: boolean) => void;
</script>

<div
  class="flex w-full items-center rounded-lg border border-white/10 bg-white/5 p-0.5 sm:hidden"
  role="radiogroup"
  aria-label="Mode"
>
  <button
    role="radio"
    aria-label="Core"
    aria-checked={!nerdMode}
    title="Toggle mode"
    onclick={() => onToggleNerdMode(!nerdMode)}
    class="min-w-0 rounded-md py-0.5 text-[10px] font-medium leading-4 transition-all {!nerdMode ? 'flex-1 bg-white/25 px-1 text-white' : 'w-4 px-0 text-white/55'}"
  >
    {#if !nerdMode}Core{/if}
  </button>
  <button
    role="radio"
    aria-label="Pro"
    aria-checked={nerdMode}
    title="Toggle mode"
    onclick={() => onToggleNerdMode(!nerdMode)}
    class="min-w-0 rounded-md py-0.5 text-[10px] font-medium leading-4 transition-all {nerdMode ? 'flex-1 bg-white/25 px-1 text-white' : 'w-4 px-0 text-white/55'}"
  >
    {#if nerdMode}Pro{/if}
  </button>
</div>

<div
  class="hidden w-full items-center rounded-lg border border-white/10 bg-white/5 p-0.5 sm:flex"
  role="radiogroup"
  aria-label="Mode"
>
  <button
    role="radio"
    aria-checked={!nerdMode}
    onclick={() => onToggleNerdMode(false)}
    class="min-w-0 flex-1 rounded-md px-1 py-0.5 text-[10px] font-medium leading-4 transition-colors {!nerdMode ? 'bg-white/25 text-white' : 'text-white/55 hover:text-white'}"
  >
    Basic
  </button>
  <button
    role="radio"
    aria-checked={nerdMode}
    onclick={() => onToggleNerdMode(true)}
    class="min-w-0 flex-1 rounded-md px-1 py-0.5 text-[10px] font-medium leading-4 transition-colors {nerdMode ? 'bg-white/25 text-white' : 'text-white/55 hover:text-white'}"
  >
    Pro
  </button>
</div>
