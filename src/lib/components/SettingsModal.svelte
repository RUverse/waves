<script lang="ts">
  import { Switch } from '$lib/components/ui/switch';
  import { Label } from '$lib/components/ui/label';
  import { Button } from '$lib/components/ui/button';

  export let isOpen: boolean;
  export let nerdMode: boolean;
  export let onClose: () => void;
  export let onToggleNerdMode: (value: boolean) => void;
</script>

{#if isOpen}
  <!-- Modal backdrop -->
  <div 
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    onclick={onClose}
    role="presentation"
  >
    <!-- Modal content -->
    <div 
      class="bg-black bg-opacity-90 border border-white border-opacity-30 rounded-lg p-6 max-w-md w-full mx-4"
      onclick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
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
          variant="outline"
          class="bg-white bg-opacity-10 hover:bg-opacity-20 text-white"
        >
          Close
        </Button>
      </div>
    </div>
  </div>
{/if}
