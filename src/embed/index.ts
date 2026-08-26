import {
  mountWave,
  type WaveConfig,
  type WaveConfigSource,
  type WaveHandle
} from '../package';

export type EmbedConfig = WaveConfig;
export type EmbedConfigSource = WaveConfigSource;
export type EmbedHandle = WaveHandle;

// Exported snippets replace this marker with their serialized config. The app
// always supplies an explicit config, so it never parses the marker at runtime.
const BAKED_CONFIG = '__WAVE_CONFIG_PLACEHOLDER__';

/** Backwards-compatible embed entry used by the editor and generated snippets. */
export function mount(
  container: HTMLElement,
  config?: EmbedConfigSource
): EmbedHandle {
  const resolvedConfig = config ?? (JSON.parse(BAKED_CONFIG) as WaveConfig);
  return mountWave(container, resolvedConfig);
}
