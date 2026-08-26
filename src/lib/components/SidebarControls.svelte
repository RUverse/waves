<script lang="ts">
  import { ChevronLeft, Github, Heart, Info } from '@lucide/svelte';

  export let onHidePanel: () => void;

  let activeActionLabel: string | null = null;

  const links = [
    {
      label: 'GitHub',
      href: 'https://github.com/RUverse/waves',
      icon: Github,
      mobilePosition: 'col-start-1 row-start-1 sm:col-auto sm:row-auto'
    },
    {
      label: 'Support',
      href: 'https://www.paypal.com/donate/?hosted_button_id=7T69MALMDEFPS',
      icon: Heart,
      mobilePosition: 'col-start-2 row-start-1 sm:col-auto sm:row-auto'
    },
    {
      label: 'About',
      href: 'https://studio.ruverse.ai/#products',
      icon: Info,
      mobilePosition: 'col-start-2 row-start-2 sm:col-auto sm:row-auto'
    }
  ];
</script>

<div class="flex w-full flex-col gap-1">
  <div class="h-3 w-full text-center text-[9px] leading-3 text-white/55">
    {activeActionLabel ?? ''}
  </div>

  <div class="grid w-full grid-cols-2 gap-0.5 sm:grid-cols-4" aria-label="Sidebar actions">
    <button
      onclick={onHidePanel}
      class="glass-btn col-start-1 row-start-2 flex h-9 min-w-0 items-center justify-center rounded-lg text-white/55 transition-colors hover:text-white sm:col-auto sm:row-auto"
      title="Hide UI"
      aria-label="Hide UI"
      onmouseenter={() => activeActionLabel = 'Hide UI'}
      onmouseleave={() => activeActionLabel = null}
    >
      <ChevronLeft class="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
    </button>

    {#each links as link}
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        class="flex h-9 min-w-0 items-center justify-center rounded-lg border border-transparent bg-transparent text-white/55 transition-[color,background-color,border-color,transform] hover:border-white/15 hover:bg-white/10 hover:text-white active:scale-[0.97] focus-visible:border-white/30 focus-visible:bg-white/10 focus-visible:text-white focus-visible:outline-none {link.mobilePosition}"
        title={link.label}
        aria-label={link.label}
        onmouseenter={() => activeActionLabel = link.label}
        onmouseleave={() => activeActionLabel = null}
      >
        <svelte:component this={link.icon} class="h-3.5 w-3.5" strokeWidth={1.7} aria-hidden="true" />
      </a>
    {/each}
  </div>
</div>
