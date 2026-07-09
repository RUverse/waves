<script lang="ts">
  import { onDestroy, tick } from "svelte";

  export let value: string = "#ffffff";
  export let onChange: (color: string) => void;
  export let label: string = "Color";

  let open = false;
  let positioned = false;
  let rootEl: HTMLElement;
  let popupEl: HTMLElement;
  let swatchEl: HTMLElement;
  let popupStyle = "position:fixed; left:-9999px; top:-9999px;";

  // Parse an incoming color (#rgb, #rrggbb, or #rrggbbaa) into a 6-digit hex for
  // the native color input plus an alpha percentage (0-100). Legacy 6-digit
  // values are treated as fully opaque.
  function parse(v: string): { hex: string; alpha: number } {
    let s = (v || "").trim();
    if (s[0] === "#") s = s.slice(1);
    if (s.length === 3) s = s.split("").map((c) => c + c).join("");
    let alpha = 100;
    if (s.length === 8) {
      alpha = Math.round((parseInt(s.slice(6, 8), 16) / 255) * 100);
      s = s.slice(0, 6);
    }
    if (s.length !== 6 || /[^0-9a-fA-F]/.test(s)) return { hex: "#ffffff", alpha };
    return { hex: "#" + s.toLowerCase(), alpha };
  }

  // Combine a 6-digit hex with an alpha percentage into 8-digit hex #rrggbbaa.
  function toHex8(hex: string, alphaPct: number): string {
    const a = Math.round((Math.max(0, Math.min(100, alphaPct)) / 100) * 255);
    return `${hex}${a.toString(16).padStart(2, "0")}`;
  }

  $: parsed = parse(value);
  $: hex = parsed.hex;
  $: alpha = parsed.alpha;

  function handleColorInput(e: Event) {
    onChange(toHex8((e.target as HTMLInputElement).value, alpha));
  }

  function handleAlphaInput(e: Event) {
    onChange(toHex8(hex, parseInt((e.target as HTMLInputElement).value, 10)));
  }

  function positionPopup() {
    if (!swatchEl) return;
    const r = swatchEl.getBoundingClientRect();
    const width = 208;
    const h = popupEl ? popupEl.offsetHeight : 100;
    let left = Math.max(8, Math.min(r.left, window.innerWidth - width - 8));
    // Prefer opening above the swatch (pickers sit near the panel bottom); fall
    // back to below if there isn't room above.
    let top = r.top - h - 8;
    if (top < 8) top = Math.min(window.innerHeight - h - 8, r.bottom + 8);
    popupStyle = `position:fixed; top:${top}px; left:${left}px; width:${width}px; z-index:9999;`;
    positioned = true;
  }

  async function toggle() {
    open = !open;
    if (open) {
      positioned = false;
      await tick();
      positionPopup();
    }
  }

  function close() {
    open = false;
  }

  function onDocPointer(e: Event) {
    if (!open) return;
    const t = e.target as Node;
    if ((rootEl && rootEl.contains(t)) || (popupEl && popupEl.contains(t))) return;
    close();
  }

  function onScrollOrResize() {
    if (open) close();
  }

  // Move the popup to <body> so it escapes the panel's overflow clipping.
  function portal(node: HTMLElement) {
    document.body.appendChild(node);
    return {
      destroy() {
        if (node.parentNode) node.parentNode.removeChild(node);
      },
    };
  }

  if (typeof window !== "undefined") {
    window.addEventListener("mousedown", onDocPointer, true);
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize, true);
  }
  onDestroy(() => {
    if (typeof window !== "undefined") {
      window.removeEventListener("mousedown", onDocPointer, true);
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize, true);
    }
  });
</script>

<div class="flex items-center gap-2" bind:this={rootEl}>
  <span class="text-white text-sm">{label}</span>
  <button
    type="button"
    bind:this={swatchEl}
    class="swatch-preview"
    onclick={toggle}
    title={label}
    aria-label={label}
    aria-haspopup="dialog"
    aria-expanded={open}
  >
    <span class="swatch-color" style={`background-color: ${toHex8(hex, alpha)}`}></span>
  </button>
</div>

{#if open}
  <div
    class="picker-popup"
    class:invisible={!positioned}
    bind:this={popupEl}
    use:portal
    style={popupStyle}
    role="dialog"
    aria-label={`${label} color`}
  >
    <input
      type="color"
      value={hex}
      oninput={handleColorInput}
      class="popup-color"
      aria-label={`${label} color`}
    />
    <div class="alpha-row">
      <span class="alpha-label">Opacity</span>
      <input
        type="range"
        min="0"
        max="100"
        step="1"
        value={alpha}
        oninput={handleAlphaInput}
        class="opacity-range"
        aria-label={`${label} opacity`}
      />
      <span class="pct tabular-nums">{alpha}%</span>
    </div>
  </div>
{/if}

<style>
  /* Single small swatch: checkerboard behind the live color+alpha */
  .swatch-preview {
    display: inline-block;
    width: 22px;
    height: 22px;
    padding: 0;
    border-radius: 5px;
    border: 1px solid rgba(150, 150, 150, 0.9);
    overflow: hidden;
    cursor: pointer;
    flex: none;
    background-image:
      linear-gradient(45deg, #808080 25%, transparent 25%),
      linear-gradient(-45deg, #808080 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #808080 75%),
      linear-gradient(-45deg, transparent 75%, #808080 75%);
    background-size: 8px 8px;
    background-position: 0 0, 0 4px, 4px -4px, -4px 0;
    background-color: #fff;
  }

  .swatch-color {
    display: block;
    width: 100%;
    height: 100%;
  }

  .picker-popup {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 10px;
    border-radius: 8px;
    background: #1a1a1a;
    border: 1px solid rgba(255, 255, 255, 0.18);
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.55);
  }

  .invisible {
    visibility: hidden;
  }

  .popup-color {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 40px;
    padding: 0;
    border: none;
    border-radius: 6px;
    background-color: transparent;
    cursor: pointer;
  }
  .popup-color::-webkit-color-swatch-wrapper {
    padding: 0;
  }
  .popup-color::-webkit-color-swatch {
    border: 1px solid rgba(150, 150, 150, 0.6);
    border-radius: 6px;
  }
  .popup-color::-moz-color-swatch {
    border: 1px solid rgba(150, 150, 150, 0.6);
    border-radius: 6px;
  }

  .alpha-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .alpha-label {
    color: rgba(255, 255, 255, 0.7);
    font-size: 11px;
  }

  .opacity-range {
    flex: 1;
    min-width: 0;
    accent-color: #ffffff;
    cursor: pointer;
  }

  .pct {
    color: #ffffff;
    font-size: 11px;
    width: 34px;
    text-align: right;
  }
</style>
