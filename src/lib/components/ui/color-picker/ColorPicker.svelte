<script lang="ts">
  export let value: string = "#ffffff";
  export let onChange: (color: string) => void;
  export let label: string = "Color";

  // Modern browsers support <input type="color" alpha>, which shows an opacity
  // slider inside the native picker and returns #rrggbbaa. Where that's missing,
  // fall back to a small inline opacity slider so alpha still works everywhere.
  const supportsAlpha = ((): boolean => {
    try {
      return "alpha" in document.createElement("input");
    } catch {
      return false;
    }
  })();

  let inputEl: HTMLInputElement;

  // Parse an incoming color (#rgb, #rrggbb, or #rrggbbaa) into a 6-digit hex plus
  // an alpha percentage (0-100). Legacy 6-digit values are treated as opaque.
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

  // Push the current color into the native input. When alpha is supported we set
  // `.alpha = true` first so an 8-digit value isn't sanitized down to #000000.
  $: if (inputEl) {
    if (supportsAlpha) {
      (inputEl as HTMLInputElement & { alpha?: boolean }).alpha = true;
      inputEl.value = toHex8(hex, alpha);
    } else {
      inputEl.value = hex;
    }
  }

  function handleColorInput(e: Event) {
    const v = (e.target as HTMLInputElement).value;
    const p = parse(v);
    // If the native picker carried its own alpha (8-digit), use it; otherwise
    // keep the current alpha from the fallback slider.
    const a = /^#?[0-9a-fA-F]{8}$/.test(v) ? p.alpha : alpha;
    onChange(toHex8(p.hex, a));
  }

  function handleAlphaInput(e: Event) {
    onChange(toHex8(hex, parseInt((e.target as HTMLInputElement).value, 10)));
  }
</script>

<div class="flex items-center gap-2">
  <span class="text-white text-sm">{label}</span>

  <div class="swatch-wrap">
    <input
      type="color"
      bind:this={inputEl}
      oninput={handleColorInput}
      class="color-swatch"
      title={label}
      aria-label={label}
    />
  </div>

  {#if !supportsAlpha}
    <input
      type="range"
      min="0"
      max="100"
      step="1"
      value={alpha}
      oninput={handleAlphaInput}
      class="opacity-range"
      aria-label={`${label} opacity`}
      title={`${label} opacity`}
    />
    <span class="text-white text-xs opacity-70 w-9 text-right tabular-nums">{alpha}%</span>
  {/if}
</div>

<style>
  /* Checkerboard behind the swatch so translucency reads even where the native
     swatch paints the color opaquely. */
  .swatch-wrap {
    display: inline-block;
    line-height: 0;
    border-radius: 6px;
    overflow: hidden;
    background-image:
      linear-gradient(45deg, #808080 25%, transparent 25%),
      linear-gradient(-45deg, #808080 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #808080 75%),
      linear-gradient(-45deg, transparent 75%, #808080 75%);
    background-size: 8px 8px;
    background-position: 0 0, 0 4px, 4px -4px, -4px 0;
    background-color: #fff;
  }

  input[type="color"] {
    -webkit-appearance: none;
    appearance: none;
    width: 2rem;
    height: 2rem;
    padding: 0;
    border: none;
    background-color: transparent;
    cursor: pointer;
    display: block;
  }

  input[type="color"]::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  /* Narrow gray border so black/dark swatches stay visible on the dark panel */
  input[type="color"]::-webkit-color-swatch {
    border: 1px solid rgba(150, 150, 150, 0.9);
    border-radius: 6px;
  }

  input[type="color"]::-moz-color-swatch {
    border: 1px solid rgba(150, 150, 150, 0.9);
    border-radius: 6px;
  }

  .opacity-range {
    min-width: 48px;
    accent-color: #ffffff;
    cursor: pointer;
  }
</style>
