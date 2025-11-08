<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { onMount, tick } from 'svelte';
  import p5 from 'p5';
  import type p5Type from 'p5';

  export let isOpen: boolean;
  export let onClose: () => void;

  // Callback to render the wave at a specific resolution
  export let onRenderWave: ((width: number, height: number) => HTMLCanvasElement | null) | null = null;

  type ResolutionPreset = 'phone' | 'desktop' | 'custom';

  interface ResolutionConfig {
    phone: { width: number; height: number };
    desktop: { width: number; height: number };
  }

  const RESOLUTIONS: ResolutionConfig = {
    phone: { width: 1080, height: 1920 },
    desktop: { width: 3840, height: 2160 },
  };

  let selectedRatio: ResolutionPreset = 'desktop';
  let customWidth = 1920;
  let customHeight = 1080;
  let isExporting = false;
  let previewContainer: HTMLElement;
  let previewP5Instance: p5Type | null = null;

  // Get current resolution based on selection
  $: currentResolution = selectedRatio === 'custom'
    ? { width: customWidth, height: customHeight }
    : RESOLUTIONS[selectedRatio];

  // Update preview when resolution changes or modal opens
  $: if (isOpen) {
    tick().then(() => updatePreview());
  }

  // Also update preview when currentResolution changes
  $: if (isOpen && currentResolution) {
    tick().then(() => updatePreview());
  }

  function updatePreview() {
    // Clean up old p5 instance
    if (previewP5Instance) {
      previewP5Instance.remove();
      previewP5Instance = null;
    }

    if (!previewContainer) {
      console.warn('Preview container not ready yet');
      return;
    }

    // Clear container
    previewContainer.innerHTML = '';

    if (!onRenderWave) {
      return;
    }

    // Get container dimensions to fit preview
    const containerWidth = previewContainer.offsetWidth;
    const containerHeight = previewContainer.offsetHeight;

    // Calculate scale to fit within container while maintaining aspect ratio
    const scale = Math.min(containerWidth / currentResolution.width, containerHeight / currentResolution.height);
    const previewWidth = currentResolution.width * scale;
    const previewHeight = currentResolution.height * scale;

    const canvas = document.createElement('canvas');
    canvas.width = previewWidth;
    canvas.height = previewHeight;
    canvas.style.border = '1px solid rgba(255, 255, 255, 0.2)';
    canvas.style.borderRadius = '4px';
    canvas.style.display = 'block';
    canvas.style.margin = 'auto';

    previewContainer.appendChild(canvas);

    // Render wave to preview canvas
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const fullCanvas = onRenderWave(currentResolution.width, currentResolution.height);
      if (fullCanvas) {
        // Scale the rendered canvas to preview size
        ctx.drawImage(fullCanvas, 0, 0, currentResolution.width, currentResolution.height, 0, 0, previewWidth, previewHeight);
      }
    }
  }

  async function handleExport() {
    if (isExporting || !onRenderWave) return;

    isExporting = true;

    try {
      // Render the wave at the selected resolution
      const canvas = onRenderWave(currentResolution.width, currentResolution.height);
      
      if (!canvas) {
        console.error('Failed to render wave');
        return;
      }

      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `wave-${Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
        isExporting = false;
        onClose();
      }, 'image/png');
    } catch (error) {
      console.error('Export failed:', error);
      isExporting = false;
    }
  }

  function validateCustomWidth(value: number) {
    customWidth = Math.max(100, Math.min(7680, Math.floor(value)));
  }

  function validateCustomHeight(value: number) {
    customHeight = Math.max(100, Math.min(7680, Math.floor(value)));
  }
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
      class="bg-black bg-opacity-90 border border-white border-opacity-30 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-screen overflow-y-auto"
      onkeydown={(e) => { if (e.key === 'Escape') onClose(); }}
      onclick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      tabindex="-1"
    >
      <h2 class="text-white text-lg font-semibold mb-6">Export Wave</h2>
      
      <div class="grid grid-cols-3 gap-6">
        <!-- Left Column: Selection and Inputs -->
        <div class="col-span-2 space-y-6">
          <!-- Resolution Preset Selection -->
          <fieldset>
            <legend class="text-white text-sm font-medium block mb-3">Export Resolution</legend>
            <div class="space-y-2">
              <label class="flex items-center gap-3 cursor-pointer">
                <input 
                  type="radio" 
                  name="ratio" 
                  value="phone"
                  bind:group={selectedRatio}
                  class="w-4 h-4"
                />
                <span class="text-white text-sm">Phone (1080 × 1920)</span>
              </label>
              <label class="flex items-center gap-3 cursor-pointer">
                <input 
                  type="radio" 
                  name="ratio" 
                  value="desktop"
                  bind:group={selectedRatio}
                  class="w-4 h-4"
                />
                <span class="text-white text-sm">Desktop (3840 × 2160)</span>
              </label>
              <label class="flex items-center gap-3 cursor-pointer">
                <input 
                  type="radio" 
                  name="ratio" 
                  value="custom"
                  bind:group={selectedRatio}
                  class="w-4 h-4"
                />
                <span class="text-white text-sm">Custom</span>
              </label>
            </div>
          </fieldset>

          <!-- Custom Resolution Inputs -->
          {#if selectedRatio === 'custom'}
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="custom-width" class="text-white text-sm font-medium block mb-2">Width (px)</label>
                <input 
                  id="custom-width"
                  type="number"
                  min="100"
                  max="7680"
                  value={customWidth}
                  onchange={(e) => validateCustomWidth(parseInt(e.currentTarget.value) || customWidth)}
                  oninput={(e) => customWidth = parseInt(e.currentTarget.value) || customWidth}
                  class="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded px-3 py-2 text-white text-sm"
                />
              </div>
              <div>
                <label for="custom-height" class="text-white text-sm font-medium block mb-2">Height (px)</label>
                <input 
                  id="custom-height"
                  type="number"
                  min="100"
                  max="7680"
                  value={customHeight}
                  onchange={(e) => validateCustomHeight(parseInt(e.currentTarget.value) || customHeight)}
                  oninput={(e) => customHeight = parseInt(e.currentTarget.value) || customHeight}
                  class="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded px-3 py-2 text-white text-sm"
                />
              </div>
            </div>
          {/if}
        </div>

        <!-- Right Column: Preview -->
        <div class="col-span-1 flex flex-col">
          <label for="preview" class="text-white text-sm font-medium block mb-3">Preview</label>
          <div 
            id="preview"
            bind:this={previewContainer}
            class="border border-white border-opacity-20 rounded p-4 flex items-center justify-center flex-1"
          >
            {#if !onRenderWave}
              <span class="text-white text-sm opacity-50">Preview unavailable</span>
            {/if}
          </div>
          <p class="text-white text-xs opacity-60 mt-2">
            {currentResolution.width} × {currentResolution.height}
          </p>
        </div>
      </div>

      <!-- Buttons -->
      <div class="flex gap-3 justify-end mt-8">
        <Button 
          onclick={onClose}
          disabled={isExporting}
          variant="outline"
          class="bg-white bg-opacity-10 hover:bg-opacity-20 text-white disabled:opacity-50"
        >
          Cancel
        </Button>
        <Button 
          onclick={handleExport}
          disabled={isExporting || !onRenderWave}
          variant="outline"
          class="bg-white bg-opacity-20 hover:bg-opacity-30 text-white disabled:opacity-50"
        >
          {isExporting ? 'Exporting...' : 'Export PNG'}
        </Button>
      </div>
    </div>
  </div>
{/if}
