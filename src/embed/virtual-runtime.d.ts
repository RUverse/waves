// The `virtual:wave-embed-runtime` module is provided by the waveEmbedRuntime
// Vite plugin (see vite.config.ts). Its default export is the minified,
// dependency-free embed runtime as a string, ready to inline into a <script>.
declare module 'virtual:wave-embed-runtime' {
  const runtime: string;
  export default runtime;
}
