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
    "w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb",
    disabled && "opacity-50 cursor-not-allowed",
    className
  )}
/>

<style>
  input[type="range"]::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    background: white;
    cursor: pointer;
    border-radius: 50%;
  }

  input[type="range"]::-moz-range-thumb {
    width: 16px;
    height: 16px;
    background: white;
    cursor: pointer;
    border-radius: 50%;
    border: none;
  }
</style>
