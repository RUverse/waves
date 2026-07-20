<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { onDestroy, tick } from 'svelte';
  import EMBED_RUNTIME from 'virtual:wave-embed-runtime';
  import { mount as mountEmbed, type EmbedConfig, type EmbedHandle } from '../../embed';

  export let isOpen: boolean;
  export let onClose: () => void;

  // Callback to render the wave at a specific resolution (Image tab)
  export let onRenderWave: ((width: number, height: number) => HTMLCanvasElement | null) | null = null;

  // Callback returning a self-contained embed config snapshot (Embed tab)
  export let onGetEmbedConfig: (() => EmbedConfig) | null = null;

  type ResolutionPreset = 'phone' | 'desktop' | 'custom';
  type Tab = 'image' | 'embed';
  type EmbedFormat = 'javascript' | 'react';

  interface ResolutionConfig {
    phone: { width: number; height: number };
    desktop: { width: number; height: number };
  }

  const RESOLUTIONS: ResolutionConfig = {
    phone: { width: 1080, height: 1920 },
    desktop: { width: 3840, height: 2160 },
  };

  let activeTab: Tab = 'image';
  let embedFormat: EmbedFormat = 'javascript';
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
  let previewResizeFrame: number | null = null;

  $: isCodeTab = activeTab === 'embed';

  // Get current resolution based on selection
  $: currentResolution = selectedRatio === 'custom'
    ? { width: customWidth, height: customHeight }
    : RESOLUTIONS[selectedRatio];

  // Rebuild preview when the modal opens or any relevant input changes.
  $: if (isOpen) {
    void activeTab; void embedFormat; void currentResolution;
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

    // Measure the padding-box content area, NOT offsetWidth/offsetHeight:
    // sizing the canvas from a measure that includes the padding makes the
    // content outgrow the box, which re-measures bigger — a feedback loop that
    // Firefox iterates forever (the box grows taller on every layout pass).
    const cs = getComputedStyle(previewContainer);
    const containerWidth = previewContainer.clientWidth -
      parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const containerHeight = previewContainer.clientHeight -
      parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);

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
    // Absolutely positioned so the preview can never influence the box's own
    // layout size (the box is sized purely by the flex/grid layout around it).
    canvas.style.position = 'absolute';
    canvas.style.left = '50%';
    canvas.style.top = '50%';
    canvas.style.transform = 'translate(-50%, -50%)';

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
    snippet = embedFormat === 'react' ? buildReactSnippet(config) : buildEmbedSnippet(config);

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
    const isReact = embedFormat === 'react';
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

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') onClose();
  }

  function handleResize() {
    if (!isOpen) return;
    if (previewResizeFrame !== null) cancelAnimationFrame(previewResizeFrame);
    previewResizeFrame = requestAnimationFrame(() => {
      previewResizeFrame = null;
      updatePreview();
    });
  }

  onDestroy(() => {
    clearPreview();
    if (copyTimer) clearTimeout(copyTimer);
    if (previewResizeFrame !== null) cancelAnimationFrame(previewResizeFrame);
  });
</script>

<svelte:window on:keydown={isOpen ? handleKeydown : undefined} on:resize={handleResize} />

{#if isOpen}
  <!-- Modal backdrop -->
  <div
    class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    onclick={onClose}
    role="presentation"
  >
    <!-- Modal content - black tinted liquid glass -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div
      class="glass-surface rounded-2xl p-4 sm:p-6 w-full max-w-2xl max-h-full overflow-y-auto"
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
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Left Column: Selection and Inputs -->
        <div class="min-w-0 md:col-span-2 space-y-6">
          {#if activeTab === 'image'}
            <!-- Resolution Preset Selection -->
            <fieldset>
              <legend class="text-white text-sm font-medium block mb-3">Export Resolution</legend>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3" role="radiogroup" aria-label="Export resolution">
                <button
                  type="button"
                  role="radio"
                  aria-checked={selectedRatio === 'phone'}
                  onclick={() => selectedRatio = 'phone'}
                  class="relative min-h-36 rounded-xl border p-3 flex flex-col items-center justify-center gap-3 transition-all {selectedRatio === 'phone' ? 'border-white/45 bg-white/16 shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_8px_24px_rgba(0,0,0,0.22)]' : 'border-white/12 bg-white/5 hover:bg-white/10 hover:border-white/25'}"
                >
                  {#if selectedRatio === 'phone'}
                    <span class="absolute right-2 top-2 flex size-4 items-center justify-center rounded-full bg-white text-black" aria-hidden="true">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5.2 4.1 7.2 8 2.9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                    </span>
                  {/if}
                  <svg width="42" height="52" viewBox="0 0 42 52" fill="none" aria-hidden="true" class="text-white/80">
                    <rect x="8" y="2" width="26" height="48" rx="6" stroke="currentColor" stroke-width="1.5" />
                    <path d="M17 6H25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                    <circle cx="21" cy="45.5" r="1" fill="currentColor" />
                  </svg>
                  <span class="text-center">
                    <span class="block text-sm font-medium text-white">Phone</span>
                    <span class="mt-0.5 block text-[10px] text-white/45">1080 × 1920</span>
                  </span>
                </button>

                <button
                  type="button"
                  role="radio"
                  aria-checked={selectedRatio === 'desktop'}
                  onclick={() => selectedRatio = 'desktop'}
                  class="relative min-h-36 rounded-xl border p-3 flex flex-col items-center justify-center gap-3 transition-all {selectedRatio === 'desktop' ? 'border-white/45 bg-white/16 shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_8px_24px_rgba(0,0,0,0.22)]' : 'border-white/12 bg-white/5 hover:bg-white/10 hover:border-white/25'}"
                >
                  {#if selectedRatio === 'desktop'}
                    <span class="absolute right-2 top-2 flex size-4 items-center justify-center rounded-full bg-white text-black" aria-hidden="true">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5.2 4.1 7.2 8 2.9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                    </span>
                  {/if}
                  <svg width="58" height="46" viewBox="0 0 58 46" fill="none" aria-hidden="true" class="text-white/80">
                    <rect x="6" y="3" width="46" height="32" rx="3.5" stroke="currentColor" stroke-width="1.5" />
                    <path d="M2.5 39H55.5L51 43H7L2.5 39Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
                    <path d="M25 39H33" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                  </svg>
                  <span class="text-center">
                    <span class="block text-sm font-medium text-white">Desktop</span>
                    <span class="mt-0.5 block text-[10px] text-white/45">3840 × 2160</span>
                  </span>
                </button>

                <div
                  class="relative min-h-36 rounded-xl border p-3 flex flex-col transition-all {selectedRatio === 'custom' ? 'border-white/45 bg-white/16 shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_8px_24px_rgba(0,0,0,0.22)]' : 'border-white/12 bg-white/5 hover:bg-white/10 hover:border-white/25'}"
                >
                  <button
                    type="button"
                    role="radio"
                    aria-checked={selectedRatio === 'custom'}
                    onclick={() => selectedRatio = 'custom'}
                    class="flex flex-1 flex-col items-center justify-center gap-2 text-white"
                  >
                    {#if selectedRatio === 'custom'}
                      <span class="absolute right-2 top-2 flex size-4 items-center justify-center rounded-full bg-white text-black" aria-hidden="true">
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5.2 4.1 7.2 8 2.9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                      </span>
                    {/if}
                    <svg width="42" height="34" viewBox="0 0 42 34" fill="none" aria-hidden="true" class="text-white/80">
                      <path d="M14 3H6C4.34 3 3 4.34 3 6V13M28 3H36C37.66 3 39 4.34 39 6V13M14 31H6C4.34 31 3 29.66 3 28V21M28 31H36C37.66 31 39 29.66 39 28V21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                    </svg>
                    <span class="text-sm font-medium">Custom</span>
                  </button>

                  {#if selectedRatio === 'custom'}
                    <div class="mt-3 grid grid-cols-2 sm:grid-cols-1 gap-2 border-t border-white/10 pt-3">
                      <label class="block">
                        <span class="mb-1 block text-[9px] font-medium uppercase tracking-wider text-white/45">Width</span>
                        <div class="flex items-center rounded-lg border border-white/15 bg-black/20 px-2 focus-within:border-white/40 focus-within:bg-black/30">
                          <input
                            aria-label="Custom width in pixels"
                            type="number"
                            min="100"
                            max="7680"
                            value={customWidth}
                            onchange={(e) => validateCustomWidth(parseInt(e.currentTarget.value) || customWidth)}
                            oninput={(e) => customWidth = parseInt(e.currentTarget.value) || customWidth}
                            class="min-w-0 w-full bg-transparent py-1.5 text-xs text-white outline-none"
                          />
                          <span class="text-[9px] text-white/35">px</span>
                        </div>
                      </label>
                      <label class="block">
                        <span class="mb-1 block text-[9px] font-medium uppercase tracking-wider text-white/45">Height</span>
                        <div class="flex items-center rounded-lg border border-white/15 bg-black/20 px-2 focus-within:border-white/40 focus-within:bg-black/30">
                          <input
                            aria-label="Custom height in pixels"
                            type="number"
                            min="100"
                            max="7680"
                            value={customHeight}
                            onchange={(e) => validateCustomHeight(parseInt(e.currentTarget.value) || customHeight)}
                            oninput={(e) => customHeight = parseInt(e.currentTarget.value) || customHeight}
                            class="min-w-0 w-full bg-transparent py-1.5 text-xs text-white outline-none"
                          />
                          <span class="text-[9px] text-white/35">px</span>
                        </div>
                      </label>
                    </div>
                  {/if}
                </div>
              </div>
            </fieldset>
          {:else}
            <!-- Embed code with JavaScript / React format selector -->
            <div class="space-y-4">
              <div
                class="inline-flex items-center rounded-lg border border-white/20 bg-white/5 p-0.5"
                role="radiogroup"
                aria-label="Embed format"
              >
                <button
                  role="radio"
                  aria-checked={embedFormat === 'javascript'}
                  onclick={() => embedFormat = 'javascript'}
                  class="rounded-md px-3 py-1.5 text-xs font-medium transition-colors {embedFormat === 'javascript' ? 'bg-white/20 text-white' : 'text-white/55 hover:text-white'}"
                >
                  JavaScript
                </button>
                <button
                  role="radio"
                  aria-checked={embedFormat === 'react'}
                  onclick={() => embedFormat = 'react'}
                  class="rounded-md px-3 py-1.5 text-xs font-medium transition-colors {embedFormat === 'react' ? 'bg-white/20 text-white' : 'text-white/55 hover:text-white'}"
                >
                  React
                </button>
              </div>

              <div>
                <label for="embed-snippet" class="text-white text-sm font-medium block mb-2">
                  {embedFormat === 'react' ? 'React component' : 'Embed code'}
                </label>
                <textarea
                  id="embed-snippet"
                  readonly
                  rows="9"
                  value={snippet}
                  onclick={(e) => e.currentTarget.select()}
                  class="w-full bg-white/20 border border-white/20 rounded px-3 py-2 text-white text-xs font-mono resize-none"
                ></textarea>
                {#if embedFormat === 'react'}
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
            </div>
          {/if}
        </div>

        <!-- Right Column: Preview -->
        <div class="min-w-0 md:col-span-1 flex flex-col">
          <span class="text-white text-sm font-medium block mb-3">Preview</span>
          <div
            id="preview"
            bind:this={previewContainer}
            class="relative border border-white/20 rounded-lg p-4 flex items-center justify-center flex-1 min-h-40 overflow-hidden"
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
      <div class="flex flex-col sm:flex-row gap-3 justify-end mt-8">
        <Button
          onclick={onClose}
          disabled={isExporting}
          variant="ghost"
          class="glass-btn h-9 w-full sm:w-auto px-5 rounded-lg text-sm font-medium whitespace-nowrap"
        >
          {isCodeTab ? 'Close' : 'Cancel'}
        </Button>
        {#if activeTab === 'image'}
          <Button
            onclick={handleExport}
            disabled={isExporting || !onRenderWave}
            variant="ghost"
            class="glass-btn is-active h-9 w-full sm:w-auto px-5 rounded-lg text-sm font-medium whitespace-nowrap"
          >
            {isExporting ? 'Exporting...' : 'Export PNG'}
          </Button>
        {:else}
          <Button
            onclick={handleDownload}
            disabled={!onGetEmbedConfig || !snippet}
            variant="ghost"
            class="glass-btn h-9 w-full sm:w-auto px-5 rounded-lg text-sm font-medium whitespace-nowrap"
          >
            {embedFormat === 'react' ? 'Download .jsx' : 'Download .html'}
          </Button>
          <Button
            onclick={handleCopy}
            disabled={!onGetEmbedConfig || !snippet}
            variant="ghost"
            class="glass-btn is-active h-9 w-full sm:w-auto px-5 rounded-lg text-sm font-medium whitespace-nowrap"
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
    /* Absolutely positioned (inset mirrors the box's p-4) so the live embed
       canvas can never feed back into the preview box's layout height —
       percentage heights inside the content-sized flex box loop in Firefox. */
    position: absolute;
    inset: 1rem;
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
