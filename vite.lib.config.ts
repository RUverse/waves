import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  build: {
    target: 'es2020',
    outDir: 'lib-dist',
    emptyOutDir: true,
    copyPublicDir: false,
    minify: true,
    lib: {
      entry: path.resolve('src/package/index.ts'),
      formats: ['es'],
      fileName: () => 'index.js'
    }
  }
});
