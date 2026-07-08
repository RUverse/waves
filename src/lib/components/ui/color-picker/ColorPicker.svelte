<script lang="ts">
  export let value: string = "#ffffff";
  export let onChange: (color: string) => void;
  export let label: string = "Color";
  
  function handleChange(e: Event) {
    const input = e.target as HTMLInputElement;
    onChange(input.value);
  }
</script>

<div class="flex items-center gap-2">
  <span class="text-white text-sm">{label}</span>
  <div class="relative">
    <input
      type="color"
      {value}
      on:input={handleChange}
      class="color-swatch w-10 h-10 rounded cursor-pointer bg-transparent"
      title={label}
    />
  </div>
</div>

<style>
  input[type="color"] {
    -webkit-appearance: none;
    appearance: none;
    background-color: transparent;
    border: none;
    cursor: pointer;
  }

  input[type="color"]::-webkit-color-swatch-wrapper {
    padding: 2px;
  }

  /* Narrow gray border so black/dark swatches stay visible on the dark panel */
  input[type="color"]::-webkit-color-swatch {
    border: 1px solid rgba(150, 150, 150, 0.9);
    border-radius: 4px;
  }

  input[type="color"]::-moz-color-swatch {
    border: 1px solid rgba(150, 150, 150, 0.9);
    border-radius: 4px;
  }
</style>
