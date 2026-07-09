<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { onDestroy, tick } from 'svelte';
  import EMBED_RUNTIME from 'virtual:wave-embed-runtime';
  import { mount as mountEmbed, type EmbedConfig, type EmbedHandle } from '../../embed';

  export let isOpen: boolean;
  export let onClose: () => void;

  // Callback to render the wave at a specific resolution (Image tab)
  export let onRenderWave: ((width: number, height: number) => HTMLCanvasElement | null) | null = null;

  // Callback returning a self-contained embed config snapshot (Embed/React tabs)
  export let onGetEmbedConfig: (() => EmbedConfig) | null = null;

  type ResolutionPreset = 'phone' | 'desktop' | 'custom';
  type Tab = 'image' | 'embed' | 'react';

  interface ResolutionConfig {
    phone: { width: number; height: number };
    desktop: { width: number; height: number };
  }

  const RESOLUTIONS: ResolutionConfig = {
    phone: { width: 1080, height: 1920 },
    desktop: { width: 3840, height: 2160 },
  };

  let activeTab: Tab = 'image';
  let selectedRatio: ResolutionPreset = 'desktop';
  let customWidth = 1920;
  let customHeight = 1080;
  let isExporting = false;
  let previewContainer: HTMLElement;
  let embedPreviewHandle: EmbedHandle | null = null;

  // Code tab state
  let snippet = '';
  let copied = false;
  let copyFailed = false;
  let copyTimer: ReturnType<typeof setTimeout> | null = null;

  $: isCodeTab = activeTab === 'embed' || activeTab === 'react';

  // Get current resolution based on selection
  $: currentResolution = selectedRatio === 'custom'
    ? { width: customWidth, height: customHeight }
    : RESOLUTIONS[selectedRatio];

  // Rebuild preview when the modal opens or any relevant input changes.
  $: if (isOpen) {
    void activeTab; void currentResolution;
    tick().then(() => updatePreview());
  }
  $: if (!isOpen) {
    clearPreview();
  }

  function clearPreview() {
    if (embedPreviewHandle) {
      embedPreviewHandle.destroy();
      embedPreviewHandle = null;
    }
    if (previewContainer) previewContainer.innerHTML = '';
  }

  function updatePreview() {
    if (!previewContainer) return;
    clearPreview();
    if (activeTab === 'image') {
      updateImagePreview();
    } else {
      updateWavePreview();
    }
  }

  function updateImagePreview() {
    if (!onRenderWave) return;

    const containerWidth = previewContainer.offsetWidth;
    const containerHeight = previewContainer.offsetHeight;

    const scale = Math.min(
      containerWidth / currentResolution.width,
      containerHeight / currentResolution.height
    );
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

    const ctx = canvas.getContext('2d');
    if (ctx) {
      const fullCanvas = onRenderWave(currentResolution.width, currentResolution.height);
      if (fullCanvas) {
        ctx.drawImage(
          fullCanvas,
          0, 0, currentResolution.width, currentResolution.height,
          0, 0, previewWidth, previewHeight
        );
      }
    }
  }

  function updateWavePreview() {
    if (!onGetEmbedConfig) return;
    const config = onGetEmbedConfig();

    // Keep the copyable code in sync with what the preview shows.
    snippet = activeTab === 'react' ? buildReactSnippet(config) : buildEmbedSnippet(config);

    // Mount the REAL runtime into a checkerboard holder so translucency is
    // visible and the preview exercises the exact code the snippet ships.
    const holder = document.createElement('div');
    holder.className = 'embed-preview-holder';
    previewContainer.appendChild(holder);
    embedPreviewHandle = mountEmbed(holder, config);
  }

  // Bake the wave's values into the runtime blob, so the emitted code calls
  // mount() with no config argument — nothing for the user to configure.
  function bakeRuntime(cfg: EmbedConfig): string {
    const jsLiteral = JSON.stringify(JSON.stringify(cfg)); // a quoted JS string
    return EMBED_RUNTIME.replace(/(["'])__WAVE_CONFIG_PLACEHOLDER__\1/, () => jsLiteral);
  }

  function buildEmbedSnippet(cfg: EmbedConfig): string {
    const id = 'wave-' + Math.random().toString(36).slice(2, 10);
    const rt = bakeRuntime(cfg).replace(/<\//g, '<\\/');
    return `<div id="${id}" style="width:100%;height:100%"></div>
<script>
(function(){
${rt}
WaveEmbed.mount(document.getElementById("${id}"));
})();
<\/script>`;
  }

  function buildReactSnippet(cfg: EmbedConfig): string {
    const runtime = JSON.stringify(bakeRuntime(cfg));
    return `import { useEffect, useRef } from "react";

// Self-contained animated wave — no dependencies, no config, no build step.
// Just drop <MyWave /> anywhere; it fills its parent (give the parent a size).
const RUNTIME = ${runtime};

export default function MyWave() {
  const ref = useRef(null);
  useEffect(() => {
    const WaveEmbed = new Function(RUNTIME + "; return WaveEmbed;")();
    const handle = WaveEmbed.mount(ref.current);
    return () => handle.destroy();
  }, []);
  return <div ref={ref} style={{ width: "100%", height: "100%" }} />;
}
`;
  }

  function fullHtmlDoc(sn: string): string {
    return `<!doctype html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Wave</title>
<style>html,body{height:100%;margin:0}</style>
</head>
<body>
${sn}
</body>
</html>`;
  }

  async function handleCopy() {
    let ok = false;
    try {
      await navigator.clipboard.writeText(snippet);
      ok = true;
    } catch {
      // Fallback for insecure origins / denied permission: select + execCommand.
      const ta = document.getElementById('embed-snippet') as HTMLTextAreaElement | null;
      if (ta) {
        ta.focus();
        ta.select();
        try {
          ok = document.execCommand('copy');
        } catch {
          ok = false;
        }
      }
    }

    if (copyTimer) clearTimeout(copyTimer);
    if (ok) {
      copied = true;
      copyFailed = false;
      copyTimer = setTimeout(() => (copied = false), 1500);
    } else {
      // Don't claim success — tell the user to copy manually from the textarea.
      copyFailed = true;
      copied = false;
      copyTimer = setTimeout(() => (copyFailed = false), 3000);
    }
  }

  function handleDownload() {
    const isReact = activeTab === 'react';
    const content = isReact ? snippet : fullHtmlDoc(snippet);
    const blob = new Blob([content], { type: isReact ? 'text/plain' : 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = isReact ? 'MyWave.jsx' : `wave-embed-${Date.now()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async function handleExport() {
    if (isExporting || !onRenderWave) return;

    isExporting = true;

    try {
      const canvas = onRenderWave(currentResolution.width, currentResolution.height);

      if (!canvas) {
        console.error('Failed to render wave');
        return;
      }

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

  const INPUT_CLASS =
    'w-full bg-white/20 border border-white/20 rounded px-3 py-2 text-white text-sm';

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') onClose();
  }

  onDestroy(() => {
    clearPreview();
    if (copyTimer) clearTimeout(copyTimer);
  });
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
      class="glass-surface rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-screen overflow-y-auto"
      onclick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      tabindex="-1"
    >
      <h2 class="text-white text-lg font-semibold mb-4">Export Wave</h2>

      <!-- Tabs -->
      <div class="flex gap-1 mb-6 border-b border-white/10">
        <button
          class="px-4 py-2 text-sm {activeTab === 'image' ? 'text-white border-b-2 border-white' : 'text-white text-opacity-50'}"
          onclick={() => activeTab = 'image'}
        >
          Image
        </button>
        <button
          class="px-4 py-2 text-sm {activeTab === 'embed' ? 'text-white border-b-2 border-white' : 'text-white text-opacity-50'}"
          onclick={() => activeTab = 'embed'}
        >
          Embed
        </button>
        <button
          class="px-4 py-2 text-sm {activeTab === 'react' ? 'text-white border-b-2 border-white' : 'text-white text-opacity-50'}"
          onclick={() => activeTab = 'react'}
        >
          React
        </button>
      </div>

      <div class="grid grid-cols-3 gap-6">
        <!-- Left Column: Selection and Inputs -->
        <div class="col-span-2 space-y-6">
          {#if activeTab === 'image'}
            <!-- Resolution Preset Selection -->
            <fieldset>
              <legend class="text-white text-sm font-medium block mb-3">Export Resolution</legend>
              <div class="space-y-2">
                <label class="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="ratio" value="phone" bind:group={selectedRatio} class="w-4 h-4" />
                  <span class="text-white text-sm">Phone (1080 × 1920)</span>
                </label>
                <label class="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="ratio" value="desktop" bind:group={selectedRatio} class="w-4 h-4" />
                  <span class="text-white text-sm">Desktop (3840 × 2160)</span>
                </label>
                <label class="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="ratio" value="custom" bind:group={selectedRatio} class="w-4 h-4" />
                  <span class="text-white text-sm">Custom</span>
                </label>
              </div>
            </fieldset>

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
                    class={INPUT_CLASS}
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
                    class={INPUT_CLASS}
                  />
                </div>
              </div>
            {/if}
          {:else}
            <!-- Embed / React code -->
            <div>
              <label for="embed-snippet" class="text-white text-sm font-medium block mb-2">
                {activeTab === 'react' ? 'React component' : 'Embed code'}
              </label>
              <textarea
                id="embed-snippet"
                readonly
                rows="9"
                value={snippet}
                onclick={(e) => e.currentTarget.select()}
                class="w-full bg-white/20 border border-white/20 rounded px-3 py-2 text-white text-xs font-mono resize-none"
              ></textarea>
              {#if activeTab === 'react'}
                <p class="text-white text-xs opacity-70 mt-2">
                  Save as <span class="font-mono">MyWave.jsx</span>, then use
                  <span class="font-mono">&lt;MyWave /&gt;</span>. It fills its parent — give the
                  parent a height. Self-contained, no dependencies.
                </p>
              {:else}
                <p class="text-white text-xs opacity-70 mt-2">
                  Self-contained — no external dependencies. Paste into any page; the wave fills
                  its container. Set the background color's opacity to 0 for a see-through embed.
                </p>
              {/if}
            </div>
          {/if}
        </div>

        <!-- Right Column: Preview -->
        <div class="col-span-1 flex flex-col">
          <span class="text-white text-sm font-medium block mb-3">Preview</span>
          <div
            id="preview"
            bind:this={previewContainer}
            class="border border-white/20 rounded-lg p-4 flex items-center justify-center flex-1 min-h-40 overflow-hidden"
          >
            {#if activeTab === 'image' && !onRenderWave}
              <span class="text-white text-sm opacity-50">Preview unavailable</span>
            {:else if isCodeTab && !onGetEmbedConfig}
              <span class="text-white text-sm opacity-50">Preview unavailable</span>
            {/if}
          </div>
          {#if activeTab === 'image'}
            <p class="text-white text-xs opacity-60 mt-2">
              {currentResolution.width} × {currentResolution.height}
            </p>
          {/if}
        </div>
      </div>

      <!-- Buttons -->
      <div class="flex gap-3 justify-end mt-8">
        <Button
          onclick={onClose}
          disabled={isExporting}
          variant="ghost"
          class="glass-btn h-9 px-5 rounded-lg text-sm font-medium"
        >
          {isCodeTab ? 'Close' : 'Cancel'}
        </Button>
        {#if activeTab === 'image'}
          <Button
            onclick={handleExport}
            disabled={isExporting || !onRenderWave}
            variant="ghost"
            class="glass-btn is-active h-9 px-5 rounded-lg text-sm font-medium"
          >
            {isExporting ? 'Exporting...' : 'Export PNG'}
          </Button>
        {:else}
          <Button
            onclick={handleDownload}
            disabled={!onGetEmbedConfig || !snippet}
            variant="ghost"
            class="glass-btn h-9 px-5 rounded-lg text-sm font-medium"
          >
            {activeTab === 'react' ? 'Download .jsx' : 'Download .html'}
          </Button>
          <Button
            onclick={handleCopy}
            disabled={!onGetEmbedConfig || !snippet}
            variant="ghost"
            class="glass-btn is-active h-9 px-5 rounded-lg text-sm font-medium"
          >
            {copied ? 'Copied!' : copyFailed ? 'Press Ctrl+C' : 'Copy code'}
          </Button>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  :global(.embed-preview-holder) {
    width: 100%;
    height: 100%;
    min-height: 160px;
    border-radius: 4px;
    overflow: hidden;
    /* Checkerboard so a translucent embed background is visible in the preview */
    background-image:
      linear-gradient(45deg, #3a3a3a 25%, transparent 25%),
      linear-gradient(-45deg, #3a3a3a 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #3a3a3a 75%),
      linear-gradient(-45deg, transparent 75%, #3a3a3a 75%);
    background-size: 16px 16px;
    background-position: 0 0, 0 8px, 8px -8px, -8px 0;
    background-color: #202020;
  }
</style>
