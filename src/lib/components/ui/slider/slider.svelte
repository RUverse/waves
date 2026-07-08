<script lang="ts">
  import { cn } from '$lib/utils';

  let className: string | undefined = undefined;
  export { className as class };
  export let value: number = 0;
  export let min: number = 0;
  export let max: number = 100;
  export let step: number = 1;
  export let disabled: boolean = false;
</script>

<input
  type="range"
  bind:value
  {min}
  {max}
  {step}
  {disabled}
  class={cn(
    "w-full h-1.5 rounded-full appearance-none cursor-pointer slider-track",
    disabled && "opacity-50 cursor-not-allowed",
    className
  )}
/>

<style>
  .slider-track {
    background: rgba(255, 255, 255, 0.14);
    transition: background 0.15s ease;
  }
  .slider-track:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  input[type="range"]::-webkit-slider-thumb {
    appearance: none;
    width: 15px;
    height: 15px;
    background: #fff;
    cursor: pointer;
    border-radius: 50%;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
    transition: transform 0.12s ease;
  }
  input[type="range"]::-webkit-slider-thumb:hover {
    transform: scale(1.15);
  }

  input[type="range"]::-moz-range-thumb {
    width: 15px;
    height: 15px;
    background: #fff;
    cursor: pointer;
    border-radius: 50%;
    border: none;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
  }
</style>
