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
  let svEl: HTMLElement;
  let popupStyle = "position:fixed; left:-9999px; top:-9999px;";

  // Local HSVA state — authoritative while the picker is open, so dragging never
  // jitters from lossy hex round-trips. Seeded from `value` when the popup opens.
  let h = 0; // 0-360
  let s = 1; // 0-1
  let v = 1; // 0-1
  let a = 100; // 0-100 (alpha %)

  // --- color helpers ---
  function parse(val: string): { hex: string; alpha: number } {
    let str = (val || "").trim();
    if (str[0] === "#") str = str.slice(1);
    if (str.length === 3) str = str.split("").map((c) => c + c).join("");
    let alpha = 100;
    if (str.length === 8) {
      alpha = Math.round((parseInt(str.slice(6, 8), 16) / 255) * 100);
      str = str.slice(0, 6);
    }
    if (str.length !== 6 || /[^0-9a-fA-F]/.test(str)) return { hex: "#ffffff", alpha };
    return { hex: "#" + str.toLowerCase(), alpha };
  }

  function hexToRgb(hex: string) {
    const n = parseInt(hex.slice(1), 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  function rgbToHex(r: number, g: number, b: number) {
    return "#" + [r, g, b].map((x) => Math.round(x).toString(16).padStart(2, "0")).join("");
  }
  function rgbToHsv(r: number, g: number, b: number) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
    let hh = 0;
    if (d) {
      if (max === r) hh = ((g - b) / d) % 6;
      else if (max === g) hh = (b - r) / d + 2;
      else hh = (r - g) / d + 4;
      hh *= 60;
      if (hh < 0) hh += 360;
    }
    return { h: hh, s: max === 0 ? 0 : d / max, v: max };
  }
  function hsvToRgb(hh: number, ss: number, vv: number) {
    const c = vv * ss;
    const x = c * (1 - Math.abs(((hh / 60) % 2) - 1));
    const m = vv - c;
    let r = 0, g = 0, b = 0;
    if (hh < 60) { r = c; g = x; }
    else if (hh < 120) { r = x; g = c; }
    else if (hh < 180) { g = c; b = x; }
    else if (hh < 240) { g = x; b = c; }
    else if (hh < 300) { r = x; b = c; }
    else { r = c; b = x; }
    return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
  }
  function toHex8(hex: string, alphaPct: number): string {
    const al = Math.round((Math.max(0, Math.min(100, alphaPct)) / 100) * 255);
    return `${hex}${al.toString(16).padStart(2, "0")}`;
  }

  // Live derived color from local HSVA (used for previews + gradients)
  $: rgb = hsvToRgb(h, s, v);
  $: hex = rgbToHex(rgb.r, rgb.g, rgb.b);
  $: hex8 = toHex8(hex, a);
  $: hueHex = (() => { const c = hsvToRgb(h, 1, 1); return rgbToHex(c.r, c.g, c.b); })();

  // The swatch in the row reflects the committed `value` even while closed.
  $: swatchColor = (() => { const p = parse(value); return toHex8(p.hex, p.alpha); })();

  function initFromValue() {
    const p = parse(value);
    const { r, g, b } = hexToRgb(p.hex);
    const hsv = rgbToHsv(r, g, b);
    // Keep current hue when picking a greyscale color so the SV area stays put.
    h = hsv.s === 0 ? h : hsv.h;
    s = hsv.s;
    v = hsv.v;
    a = p.alpha;
  }

  function emit() {
    // Compute directly from the current H/S/V/A rather than the reactive `hex8`,
    // which hasn't recomputed yet within the same event handler.
    const c = hsvToRgb(h, s, v);
    onChange(toHex8(rgbToHex(c.r, c.g, c.b), a));
  }

  // --- SV area dragging ---
  function updateSVFromEvent(e: PointerEvent) {
    if (!svEl) return;
    const r = svEl.getBoundingClientRect();
    s = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    v = 1 - Math.max(0, Math.min(1, (e.clientY - r.top) / r.height));
    emit();
  }
  function onSVPointerDown(e: PointerEvent) {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    updateSVFromEvent(e);
    const move = (ev: PointerEvent) => updateSVFromEvent(ev);
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  function onHueInput(e: Event) { h = parseInt((e.target as HTMLInputElement).value, 10); emit(); }
  function onAlphaInput(e: Event) { a = parseInt((e.target as HTMLInputElement).value, 10); emit(); }

  // --- popup open/close/positioning ---
  function positionPopup() {
    if (!swatchEl) return;
    const r = swatchEl.getBoundingClientRect();
    const width = 216;
    const hgt = popupEl ? popupEl.offsetHeight : 240;
    const left = Math.max(8, Math.min(r.left, window.innerWidth - width - 8));
    let top = r.top - hgt - 8;
    if (top < 8) top = Math.min(window.innerHeight - hgt - 8, r.bottom + 8);
    popupStyle = `position:fixed; top:${top}px; left:${left}px; width:${width}px; z-index:9999;`;
    positioned = true;
  }
  async function toggle() {
    open = !open;
    if (open) {
      initFromValue();
      positioned = false;
      await tick();
      positionPopup();
    }
  }
  function close() { open = false; }

  function onDocPointer(e: Event) {
    if (!open) return;
    const t = e.target as Node;
    if ((rootEl && rootEl.contains(t)) || (popupEl && popupEl.contains(t))) return;
    close();
  }
  function onScrollOrResize() { if (open) close(); }

  // Close on Escape and stop it here so the app doesn't also toggle the panel.
  function onKeydown(e: KeyboardEvent) {
    if (open && e.key === "Escape") {
      close();
      e.stopPropagation();
    }
  }

  function portal(node: HTMLElement) {
    document.body.appendChild(node);
    return { destroy() { if (node.parentNode) node.parentNode.removeChild(node); } };
  }

  if (typeof window !== "undefined") {
    window.addEventListener("mousedown", onDocPointer, true);
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize, true);
    window.addEventListener("keydown", onKeydown, true);
  }
  onDestroy(() => {
    if (typeof window !== "undefined") {
      window.removeEventListener("mousedown", onDocPointer, true);
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize, true);
      window.removeEventListener("keydown", onKeydown, true);
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
    <span class="swatch-color" style={`background-color: ${swatchColor}`}></span>
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
    <!-- Saturation / Value area -->
    <div
      class="sv-area"
      bind:this={svEl}
      style={`background-color:${hueHex}`}
      onpointerdown={onSVPointerDown}
    >
      <div class="sv-white"></div>
      <div class="sv-black"></div>
      <div class="sv-thumb" style={`left:${s * 100}%; top:${(1 - v) * 100}%; background:${hex}`}></div>
    </div>

    <!-- Hue -->
    <input
      class="hue-range"
      type="range"
      min="0"
      max="360"
      step="1"
      value={h}
      oninput={onHueInput}
      aria-label="Hue"
    />

    <!-- Alpha -->
    <div class="alpha-track" style={`--c:${hex}`}>
      <input
        class="alpha-range"
        type="range"
        min="0"
        max="100"
        step="1"
        value={a}
        oninput={onAlphaInput}
        aria-label="Opacity"
      />
    </div>

    <div class="readout">
      <span class="chip" style={`background-color:${hex8}`}></span>
      <span class="hexval">{hex8}</span>
      <span class="pct tabular-nums">{a}%</span>
    </div>
  </div>
{/if}

<style>
  .swatch-preview {
    display: inline-block;
    width: 24px;
    height: 24px;
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
  .swatch-color { display: block; width: 100%; height: 100%; }

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
  .invisible { visibility: hidden; }

  .sv-area {
    position: relative;
    width: 100%;
    height: 130px;
    border-radius: 6px;
    cursor: crosshair;
    touch-action: none;
    overflow: hidden;
  }
  .sv-white,
  .sv-black {
    position: absolute;
    inset: 0;
  }
  .sv-white { background: linear-gradient(to right, #fff, transparent); }
  .sv-black { background: linear-gradient(to top, #000, transparent); }
  .sv-thumb {
    position: absolute;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid #fff;
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.5);
    transform: translate(-50%, -50%);
    pointer-events: none;
  }

  .hue-range {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 12px;
    border-radius: 6px;
    outline: none;
    cursor: pointer;
    background: linear-gradient(
      to right,
      #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%
    );
  }

  .alpha-track {
    border-radius: 6px;
    background-image:
      linear-gradient(45deg, #808080 25%, transparent 25%),
      linear-gradient(-45deg, #808080 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #808080 75%),
      linear-gradient(-45deg, transparent 75%, #808080 75%);
    background-size: 10px 10px;
    background-position: 0 0, 0 5px, 5px -5px, -5px 0;
    background-color: #fff;
  }
  .alpha-range {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 12px;
    border-radius: 6px;
    outline: none;
    cursor: pointer;
    background: linear-gradient(to right, transparent, var(--c));
  }

  /* Shared slider thumbs */
  .hue-range::-webkit-slider-thumb,
  .alpha-range::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #fff;
    border: 1px solid rgba(0, 0, 0, 0.5);
    cursor: pointer;
  }
  .hue-range::-moz-range-thumb,
  .alpha-range::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #fff;
    border: 1px solid rgba(0, 0, 0, 0.5);
    cursor: pointer;
  }

  .readout {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .chip {
    width: 18px;
    height: 18px;
    border-radius: 4px;
    border: 1px solid rgba(150, 150, 150, 0.6);
    flex: none;
  }
  .hexval {
    color: #fff;
    font-size: 11px;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    flex: 1;
  }
  .pct {
    color: rgba(255, 255, 255, 0.7);
    font-size: 11px;
  }
</style>
