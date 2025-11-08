import { writable, derived, get } from 'svelte/store';
import { 
  loadSavedWaves, 
  saveSavedWaves, 
  createWave,
  type Wave,
  type WaveConfig
} from '$lib/configStorage';

/**
 * Hook for managing saved wave configurations
 */
export function createWaveManagement() {
  const savedWaves = writable<Wave[]>(loadSavedWaves());
  const activeWaveId = writable<string | null>(null);
  const savedWaveSnapshot = writable<string | null>(null);

  /**
   * Saves the current wave configuration
   * If an active wave is selected, it updates that wave
   * Otherwise, it creates a new wave
   */
  function saveWave(config: WaveConfig, currentConfigString: string) {
    const wave = createWave(config);
    const currentActiveId = get(activeWaveId);
    
    // If updating existing wave, replace it
    if (currentActiveId) {
      savedWaves.update(waves => 
        waves.map(w => 
          w.id === currentActiveId ? { ...wave, timestamp: w.timestamp, name: w.name } : w
        )
      );
    } else {
      // Add new wave
      savedWaves.update(waves => [...waves, wave]);
      activeWaveId.set(wave.id);
    }
    
    saveSavedWaves(get(savedWaves));
    savedWaveSnapshot.set(currentConfigString);
  }

  /**
   * Saves the current configuration as a new wave
   * Always creates a new wave, even if one is currently active
   */
  function saveConfigAsNew(config: WaveConfig, currentConfigString: string) {
    const wave = createWave(config);
    
    // Always add as new wave
    savedWaves.update(waves => [...waves, wave]);
    activeWaveId.set(wave.id);
    
    saveSavedWaves(get(savedWaves));
    savedWaveSnapshot.set(currentConfigString);
  }

  /**
   * Loads a saved wave configuration
   * Returns the wave config to be applied to the UI
   */
  function selectWave(wave: Wave): WaveConfig {
    activeWaveId.set(wave.id);
    savedWaveSnapshot.set(JSON.stringify(wave.config));
    return wave.config;
  }

  /**
   * Deletes a saved wave
   * If the deleted wave was active, clears the active state
   */
  function deleteWave(id: string) {
    savedWaves.update(waves => waves.filter(w => w.id !== id));
    saveSavedWaves(get(savedWaves));
    
    if (get(activeWaveId) === id) {
      activeWaveId.set(null);
      savedWaveSnapshot.set(null);
    }
  }

  /**
   * Checks if the current configuration has unsaved changes
   */
  const hasUnsavedChanges = derived(
    [activeWaveId, savedWaveSnapshot],
    ([$activeWaveId, $savedWaveSnapshot], set) => {
      // This will be updated externally by comparing currentConfigString
      set(false);
    }
  );

  /**
   * Clears the active wave selection
   */
  function clearActiveWave() {
    activeWaveId.set(null);
    savedWaveSnapshot.set(null);
  }

  return {
    savedWaves,
    activeWaveId,
    savedWaveSnapshot,
    saveWave,
    saveConfigAsNew,
    selectWave,
    deleteWave,
    clearActiveWave
  };
}
