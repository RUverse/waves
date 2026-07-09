<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Label } from '$lib/components/ui/label';
  import { Slider } from '$lib/components/ui/slider';
  import ResetIcon from './ResetIcon.svelte';
  import { INPUT_RANGE_FACTOR } from '$lib/constants';

  // Main setting
  export let label: string;
  export let value: number;
  export let min: number;
  export let max: number;
  export let step: number;
  export let decimals: number = 1;
  export let onReset: () => void;
  export let nerdMode: boolean = false;

  // Variation (optional)
  export let hasVariation: boolean = false;
  export let variation: number = 0;
  export let variationMin: number = 0;
  export let variationMax: number = 1;
  export let variationStep: number = 0.01;
  export let variationDecimals: number = 2;
  export let onResetVariation: () => void = () => {};

  // Whether the variation row is expanded. Auto-open when a loaded config
  // already has a non-zero variation.
  let showVar = variation !== 0;
  $: if (variation !== 0) showVar = true;

  // Text inputs accept values up to INPUT_RANGE_FACTOR× beyond the slider,
  // extended outward on both ends (a positive lower bound is kept as-is).
  $: inputMin = Math.min(min, min * INPUT_RANGE_FACTOR);
  $: inputMax = Math.max(max, max * INPUT_RANGE_FACTOR);
  $: varInputMin = Math.min(variationMin, variationMin * INPUT_RANGE_FACTOR);
  $: varInputMax = Math.max(variationMax, variationMax * INPUT_RANGE_FACTOR);

  function toggleVar() {
    if (showVar) {
      // Cross: reset + remove the variation.
      onResetVariation();
      showVar = false;
    } else {
      showVar = true;
    }
  }

  function clamp(n: number, lo: number, hi: number): number {
    return Math.min(hi, Math.max(lo, n));
  }

  function fmt(n: number, d: number): string {
    if (!Number.isFinite(n)) return '';
    return d > 0 ? n.toFixed(d) : Math.round(n).toString();
  }

  function commitValue(e: Event) {
    const el = e.currentTarget as HTMLInputElement;
    const n = parseFloat(el.value);
    if (Number.isFinite(n)) {
      value = clamp(n, inputMin, inputMax);
    }
    el.value = fmt(value, decimals);
  }

  function commitVariation(e: Event) {
    const el = e.currentTarget as HTMLInputElement;
    const n = parseFloat(el.value);
    if (Number.isFinite(n)) {
      variation = clamp(n, varInputMin, varInputMax);
    }
    el.value = fmt(variation, variationDecimals);
  }
</script>

<div>
  <!-- Main row -->
  <div class="flex items-center space-x-2">
    <Button
      onclick={onReset}
      variant="ghost"
      class="glass-btn w-6 h-6 p-0 rounded-md flex items-center justify-center shrink-0"
      title={`Reset ${label.toLowerCase()}`}
    >
      <ResetIcon />
    </Button>
    <Label class="text-white w-16 sm:w-24 shrink-0">{label}</Label>
    <Slider bind:value {min} {max} {step} class="w-20 sm:w-32" />

    {#if nerdMode}
      <input
        type="number"
        class="setting-input"
        value={fmt(value, decimals)}
        min={inputMin}
        max={inputMax}
        {step}
        on:change={commitValue}
      />
    {/if}

    {#if hasVariation}
      <Button
        onclick={toggleVar}
        variant="ghost"
        class="glass-btn w-6 h-6 p-0 rounded-md flex items-center justify-center shrink-0"
        title={showVar ? `Remove ${label.toLowerCase()} variance` : `Add ${label.toLowerCase()} variance`}
      >
        {#if showVar}
          <!-- Cross -->
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        {:else}
          <!-- Variance (±) -->
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 3v6M5 6h6M4 13h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        {/if}
      </Button>
    {/if}
  </div>

  <!-- Variation row -->
  {#if hasVariation && showVar}
    <div class="flex items-center space-x-2 ml-8 mt-1">
      <Button
        onclick={onResetVariation}
        variant="ghost"
        class="glass-btn w-6 h-6 p-0 rounded-md flex items-center justify-center shrink-0"
        title="Reset variance"
      >
        <ResetIcon />
      </Button>
      <Label class="text-white/70 text-xs w-10 sm:w-16 shrink-0">Var</Label>
      <Slider
        bind:value={variation}
        min={variationMin}
        max={variationMax}
        step={variationStep}
        class="w-20 sm:w-32"
      />
      {#if nerdMode}
        <input
          type="number"
          class="setting-input"
          value={fmt(variation, variationDecimals)}
          min={varInputMin}
          max={varInputMax}
          step={variationStep}
          on:change={commitVariation}
        />
      {/if}
    </div>
  {/if}
</div>

<style>
  .setting-input {
    width: 3.25rem;
    flex-shrink: 0;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 0.375rem;
    padding: 0.125rem 0.25rem;
    color: #fff;
    font-size: 0.75rem;
    text-align: right;
    outline: none;
  }
  .setting-input:focus {
    border-color: rgba(255, 255, 255, 0.35);
    background: rgba(255, 255, 255, 0.12);
  }
  /* Hide the number spinners for a cleaner look */
  .setting-input::-webkit-outer-spin-button,
  .setting-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  .setting-input {
    -moz-appearance: textfield;
    appearance: textfield;
  }
</style>
