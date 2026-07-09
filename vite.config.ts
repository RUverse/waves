import tailwindcss from '@tailwindcss/vite';
import { defineConfig, type Plugin } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { build } from 'esbuild';
import path from 'path';

const EMBED_ENTRY = path.resolve('src/embed/index.ts');
const VIRTUAL_ID = 'virtual:wave-embed-runtime';
const RESOLVED_ID = '\0' + VIRTUAL_ID;

/**
 * Compiles the embed runtime (src/embed/index.ts) into a minified, dependency-
 * free IIFE and exposes it as a string via `import RT from 'virtual:wave-embed-
 * runtime'`. Building on demand (in both dev and prod) means there is never a
 * committed/stale artifact — the emitted snippet always matches the source.
 */
function waveEmbedRuntime(): Plugin {
  let cache: string | null = null;

  const compile = async (): Promise<string> => {
    const result = await build({
      entryPoints: [EMBED_ENTRY],
      bundle: true,
      minify: true,
      write: false,
      format: 'iife',
      globalName: 'WaveEmbed',
      target: 'es2018',
    });
    return result.outputFiles[0].text;
  };

  return {
    name: 'wave-embed-runtime',
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID;
    },
    async load(id) {
      if (id !== RESOLVED_ID) return;
      cache ??= await compile();
      return `export default ${JSON.stringify(cache)};`;
    },
    async handleHotUpdate(ctx) {
      // Invalidate + reload the virtual module when the runtime source changes.
      if (/[\\/]src[\\/]embed[\\/]|waveMath\.ts$|constants\.ts$/.test(ctx.file)) {
        cache = null;
        const mod = ctx.server.moduleGraph.getModuleById(RESOLVED_ID);
        if (mod) await ctx.server.reloadModule(mod);
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), svelte(), waveEmbedRuntime()],
  resolve: {
    alias: {
      $lib: path.resolve('./src/lib'),
      $hooks: path.resolve('./src/hooks'),
    },
  },
});
