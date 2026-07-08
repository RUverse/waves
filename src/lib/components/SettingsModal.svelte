<script lang="ts">
  import { Switch } from '$lib/components/ui/switch';
  import { Label } from '$lib/components/ui/label';
  import { Button } from '$lib/components/ui/button';

  export let isOpen: boolean;
  export let nerdMode: boolean;
  export let onClose: () => void;
  export let onToggleNerdMode: (value: boolean) => void;

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') onClose();
  }
</script>

<svelte:window on:keydown={isOpen ? handleKeydown : undefined} />

{#if isOpen}
  <!-- Modal backdrop -->
  <div
    class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
    onclick={onClose}
    role="presentation"
  >
    <!-- Modal content - black tinted liquid glass -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div
      class="glass-surface rounded-2xl p-6 max-w-md w-full mx-4"
      onclick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      tabindex="-1"
    >
      <h2 class="text-white text-lg font-semibold mb-6">Settings</h2>

      <div class="flex items-center justify-between mb-6">
        <Label for="slider-values" class="text-white">Nerd Mode</Label>
        <Switch
          id="slider-values"
          checked={nerdMode}
          onCheckedChange={onToggleNerdMode}
        />
      </div>

      <div class="flex justify-end">
        <Button
          onclick={onClose}
          variant="ghost"
          class="glass-btn h-9 px-5 rounded-lg text-sm font-medium"
        >
          Close
        </Button>
      </div>
    </div>
  </div>
{/if}
