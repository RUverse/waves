# Technical Documentation: Ruwaves

## Technology Stack

### Core Technologies
- **Svelte 5**: Frontend framework using the latest runes API
- **TypeScript**: Type-safe development
- **Vite**: Build tool and development server
- **p5.js**: Graphics rendering library for wave visualization
- **Tailwind CSS**: Utility-first CSS framework
- **Canvas 2D**: Dependency-free renderer used by embeds and `@ruverse/waves`

### UI Components
- Custom Svelte components built with Tailwind
- Shadcn-style UI components (Button, Switch, Slider, Label)

---

## Project Structure

```
ruwaves/
├── .github/
│   └── workflows/
│       └── release.yml          # Tag-driven npm release preparation
├── .env.example                # Portable local cross-repository settings
├── src/
│   ├── package/
│   │   └── index.ts             # Public package API and browser runtime
│   ├── embed/
│   │   └── index.ts             # Self-contained embed compatibility wrapper
│   ├── lib/
│   │   ├── components/
│   │   │   ├── ui/              # Reusable UI components
│   │   │   │   ├── button/
│   │   │   │   ├── label/
│   │   │   │   ├── slider/
│   │   │   │   └── switch/
│   │   │   ├── Actions.svelte    # Action buttons (reset, save)
│   │   │   ├── ConfigTabs.svelte # Saved configuration tabs
│   │   │   └── ControlPanel.svelte # Main control panel
│   │   ├── configStorage.ts     # Configuration persistence logic
│   │   ├── constants.ts         # Application constants and defaults
│   │   ├── storage.ts           # Local storage utilities
│   │   ├── types.ts             # TypeScript type definitions
│   │   ├── utils.ts             # Utility functions
│   │   ├── waveLogic.ts         # Wave generation algorithms
│   │   └── waveMath.ts          # Shared Canvas/p5 rendering math
│   ├── App.svelte               # Main application component
│   ├── app.css                  # Global styles
│   └── main.ts                  # Application entry point
├── docs/
│   ├── prd.md                   # Product Requirements Document
│   └── technical.md             # This file
├── tests/                        # Public package tests
├── vite.lib.config.ts           # ESM package build
├── tsconfig.lib.json            # Package declaration build
├── release/                      # Generated npm tarballs (ignored)
└── public/                       # Static assets
```

---

## Architecture

### Deliverables and Shared Renderer

The repository produces two separate deliverables:

- The Svelte visual editor, built into `dist/`.
- The dependency-free `@ruverse/waves` ESM package, built into `lib-dist/`.

`src/lib/waveMath.ts` is the shared mathematical renderer. The editor uses it
through the p5 integration and image export, while `src/package/index.ts` uses
the Canvas 2D path for reusable web mounting. `src/embed/index.ts` wraps the
package runtime so exported JavaScript and React snippets stay visually aligned
with npm consumers.

The public configuration is compact and JSON-safe. A numeric seed plus nested
variation strengths are resolved into private per-wave arrays at runtime.
Editor UI toggles and cached arrays are not part of the public API.

The package exports `createWaveConfig()`, `mountWave()`,
`DEFAULT_WAVE_CONFIG`, and the related TypeScript config and handle types.
Mounted instances own their canvas, animation frame, observers, and media-query
listener. They support partial updates, clean repeated mounting, reduced motion,
offscreen pausing, HiDPI scaling, and idempotent destruction. Importing the
module does not access browser globals, which keeps SSR imports safe.

### Package Release Pipeline

Package changes are integrated on `dev` and promoted to the release-only
`main` branch through a release pull request. A numeric tag that exactly matches
the `package.json` version triggers `.github/workflows/release.yml`.

The workflow uses the committed Bun lockfile and performs these steps on a clean
runner:

1. Validate that the tag matches the package version and that the public package
   has no runtime dependencies.
2. Run Svelte and TypeScript checks and build the editor application.
3. Build and test the reusable Canvas runtime.
4. Create the npm tarball, reject development-only content, and import its ESM
   entry in Node without browser globals.
5. Create a provenance attestation and attach the tarball to a draft GitHub
   Release.

The workflow intentionally does not call `npm publish`. Publication remains a
separate, explicit maintainer action after the draft and package contents have
been reviewed. Local tarballs are written under ignored `release/`. Local
checkout paths and non-organization repository endpoints belong only in the
ignored `.env`, using `.env.example` as the portable template.

### Component Hierarchy

```
App.svelte (State Management & p5.js Integration)
└── ControlPanel.svelte (Layout & Prop Management)
    ├── ConfigTabs.svelte (Saved Configuration Display)
    └── Actions.svelte (Action Buttons)
        ├── Reset Seed Button
        ├── Reset Config Button
        ├── Save Button
        └── Save as New Button (conditional)
```

### State Management

#### Application State (App.svelte)
- **Wave Parameters**: amplitude, wavelength, frequency, period, spacing, waveCount
- **Toggle States**: ampToggle, waveToggle, freqToggle, perToggle, spacingToggle, waveCountToggle
- **UI State**: showPanel
- **Configuration State**: savedWaves, activeWaveId, savedWaveSnapshot, hasUnsavedChanges
- **Wave Generation**: baseAmplitudes (random seed), offset (animation time)

#### Reactive State Updates
Svelte's reactivity system automatically:
- Recalculates amplitudes when baseAmplitudes or amplitude changes
- Detects unsaved changes by comparing current config to snapshot
- Regenerates base amplitudes when wave count changes
- Persists state to localStorage whenever values change

---

## Core Systems

### 1. Wave Rendering (p5.js)

#### Sketch Setup
```typescript
sketch(p: p5) {
  setup() {
    - Create fullscreen canvas
    - Set canvas background to black
    - Configure stroke and drawing properties
  }
  
  draw() {
    - Clear canvas with black background
    - Calculate horizontal spacing for waves
    - For each wave:
      - Draw wave using vertex points
      - Apply current parameter values
      - Use individual amplitude from baseAmplitudes
      - Offset based on animation time
  }
  
  windowResized() {
    - Resize canvas to match new window dimensions
  }
}
```

#### Wave Calculation
Each wave is drawn as a series of connected vertices:
- X coordinates: Step across canvas width (every 5 pixels)
- Y coordinates: Calculated using sine function with:
  - Wavelength (horizontal compression/stretch)
  - Amplitude (vertical height)
  - Frequency (oscillation speed)
  - Period (temporal rhythm)
  - Offset (animation time)
  - Individual amplitude variation from seed

#### Animation Loop
- p5.js runs at 60 FPS by default
- Offset increments each frame based on enabled parameters
- Frequency and period control animation speed
- Smooth, continuous motion

---

### 2. Wave Generation Logic

#### Base Amplitude Generation
```typescript
generateInitialAmplitudes(amplitude: number, count: number): number[]
```
- Creates array of amplitudes, one per wave
- Each amplitude is amplitude ± 20% random variation
- Generates random wavelength offset for each wave
- Stored in `baseAmplitudes` array

#### Computed Amplitudes
```typescript
amplitudes = baseAmplitudes.map(base => (base / DEFAULT_AMPLITUDE) * amplitude)
```
- Scales base amplitudes proportionally to current amplitude slider
- Maintains relative variations between waves
- Updates reactively when amplitude changes

---

### 3. Configuration Management

#### Data Structure
```typescript
interface WaveConfig {
  amplitude: number;
  wavelength: number;
  frequency: number;
  period: number;
  spacing: number;
  waveCount: number;
  ampToggle: boolean;
  waveToggle: boolean;
  freqToggle: boolean;
  perToggle: boolean;
  spacingToggle: boolean;
  waveCountToggle: boolean;
  baseAmplitudes: number[];
}

interface Wave {
  id: string;
  name: string;
  timestamp: number;
  config: WaveConfig;
}
```

#### Storage Layer
**localStorage Keys:**
- `ruwaves-state`: Current application state
- `ruwaves-saved-waves`: Array of saved Wave objects

**Operations:**
- `createWave(config)`: Creates new Wave with UUID and timestamp
- `loadSavedWaves()`: Loads all saved configurations from localStorage
- `saveSavedWaves(waves)`: Persists configuration array to localStorage
- `loadState()`: Loads current app state
- `saveState(state)`: Persists current app state

#### Save Logic

**Save Config (`saveConfig()`)**
- If activeWaveId exists: Update existing wave (preserve name and timestamp)
- If no activeWaveId: Create new wave, set as active
- Update localStorage
- Create snapshot for change detection

**Save as New (`saveConfigAsNew()`)**
- Always creates new Wave with new ID
- Sets new wave as active
- Adds to saved waves array
- Updates localStorage and snapshot

#### Change Detection
```typescript
currentWaveConfigString = JSON.stringify(currentConfig)
hasUnsavedChanges = activeWaveId !== null && 
                   savedWaveSnapshot !== null && 
                   currentWaveConfigString !== savedWaveSnapshot
```
- Serializes current config to JSON string
- Compares to saved snapshot
- Updates yellow indicator in UI

---

### 4. State Persistence

#### Auto-save Strategy
- Svelte reactive statement watches all state variables
- Automatically calls `saveState()` on any change
- Saves to localStorage immediately
- No manual save required for general usage

#### Session Restoration
- On mount, load state from localStorage
- Restore all parameters and toggles
- Restore panel visibility
- Restore base amplitudes (random seed)
- Load saved waves array

---

## Component Details

### App.svelte

**Responsibilities:**
- Main state container
- p5.js instance management
- State persistence
- Event handlers for all actions
- Reactive computations

**Key Functions:**
- `togglePanel()`: Show/hide control panel with view transition
- `reset()`: Generate new random seed (baseAmplitudes)
- `resetConfig()`: Restore all defaults and clear active config
- `saveConfig()`: Save or update configuration
- `saveConfigAsNew()`: Create new configuration
- `selectWave(wave)`: Load saved configuration
- `deleteWave(id)`: Remove configuration

### ControlPanel.svelte

**Responsibilities:**
- Layout container for all controls
- Prop passing to child components
- Parameter sliders and toggles
- Panel toggle button

**Features:**
- View transition animation on show/hide
- Fixed positioning (bottom-left)
- Semi-transparent background

### ConfigTabs.svelte

**Responsibilities:**
- Display saved configuration tabs
- Handle tab selection
- Handle tab deletion
- Show unsaved changes indicator

**Features:**
- Tabs positioned above control panel
- Hover tooltips with full details
- Active tab highlighting
- Delete button on each tab

### Actions.svelte

**Responsibilities:**
- Render action buttons
- Handle button clicks
- Conditional rendering of "Save as New"

**Buttons:**
- Reset Seed (shuffle icon)
- Reset Config (rotate icon)
- Save (save icon)
- Save as New (save with plus icon) - only when activeWaveId exists

---

## Constants and Configuration

### Default Values (constants.ts)
```typescript
DEFAULT_AMPLITUDE = 40
DEFAULT_WAVELENGTH = 0.02
DEFAULT_FREQUENCY = 0.5
DEFAULT_PERIOD = 0.05
DEFAULT_SPACING = 1.0
DEFAULT_WAVE_COUNT = 5
```

### Parameter Ranges
All parameters have configurable min, max, step, and default values defined in `constants.ts`

### Canvas Settings
```typescript
CANVAS_SETTINGS = {
  backgroundColor: 0,      // Black
  strokeColor: 255,        // White
  strokeWeight: 2,         // Line thickness
  vertexStep: 5            // Pixels between vertices
}
```

### Wave Generation
```typescript
WAVE_GENERATION = {
  amplitudeVariation: 0.4,  // ±20% (0.8-1.2 multiplier)
  randomSeedRange: 0.04     // Wavelength randomization range
}
```

---

## Styling

### Tailwind Configuration
- Custom color scheme (minimal - mostly black/white)
- Opacity utilities for glass morphism effects
- Flexbox for layouts
- Responsive utilities

### Component Styles
- Semi-transparent panels: `bg-black bg-opacity-80`
- White text with opacity variations
- Border with low opacity for subtle separation
- Hover states for interactive elements

### Animations
- View transitions for panel show/hide
- Slide animations for smooth panel movement
- CSS transitions on hover states
- p5.js handles wave animation

---

## Performance Considerations

### Optimization Strategies
1. **p5.js Rendering**: Efficient vertex drawing, no unnecessary redraws
2. **Reactive Updates**: Svelte's fine-grained reactivity minimizes DOM updates
3. **localStorage**: Minimal read/write operations, only on actual changes
4. **Animation Frame**: p5.js uses requestAnimationFrame for smooth 60fps
5. **Canvas Sizing**: Dynamically adjusts to viewport without excess pixels

### Limitations
- Maximum 20 waves to maintain performance
- Vertex step of 5px balances smoothness and performance
- localStorage has ~5-10MB limit (more than sufficient)

---

## Browser Compatibility

### Requirements
- Modern browser with ES2015+ support
- localStorage support
- Canvas API support
- requestAnimationFrame support

### Tested Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Progressive Enhancement
- View transitions use feature detection: `if (document.startViewTransition)`
- Graceful fallback if view transitions unsupported

---

## Development

### Setup
```bash
npm install
npm run dev
```

### Build
```bash
npm run build
npm run preview  # Preview production build
```

### Type Checking
```bash
npm run check
```

---

## Data Flow

### Parameter Change Flow
```
User adjusts slider
  → Svelte binding updates parameter value
  → Reactive statement triggers:
    - Recalculation of computed values
    - Auto-save to localStorage
  → p5.js draw loop reads new value
  → Wave redraws with new parameter
  → If active config exists: Update hasUnsavedChanges
```

### Save Configuration Flow
```
User clicks save button
  → saveConfig() or saveConfigAsNew() called
  → Create WaveConfig object from current state
  → Create or update Wave object
  → Update savedWaves array
  → Save to localStorage
  → Update activeWaveId
  → Create snapshot for change detection
```

### Load Configuration Flow
```
User clicks config tab
  → selectWave(wave) called
  → Extract all parameters from wave.config
  → Update all state variables
  → Set activeWaveId
  → Create snapshot
  → p5.js draw loop renders new configuration
```

---

## Testing Considerations

### Manual Testing Checklist
- [ ] All sliders adjust waves smoothly
- [ ] Toggles enable/disable parameters correctly
- [ ] Save creates new configuration
- [ ] Save updates existing configuration when active
- [ ] Save as New always creates new configuration
- [ ] Config tabs load correctly
- [ ] Delete removes configurations
- [ ] Reset Seed changes wave patterns
- [ ] Reset Config restores defaults
- [ ] Panel toggles with spacebar
- [ ] State persists across page reload
- [ ] Responsive at different screen sizes
- [ ] Unsaved changes indicator works

### Edge Cases
- Creating first configuration
- Deleting active configuration
- Switching between configurations rapidly
- Maximum wave count (20)
- Minimum wave count (1)
- Extreme parameter values
- localStorage quota exceeded (unlikely)

---

## Known Issues & Future Improvements

### Current Limitations
- Configuration names are auto-generated (timestamp-based)
- No configuration export/import
- No undo/redo
- No configuration search/filter
- Limited to localStorage (no cloud sync)

### Technical Debt
- Consider moving p5.js code to separate module
- Add unit tests for wave logic
- Add E2E tests for user workflows
- Consider state management library for larger feature set
- Optimize localStorage writes (debounce/throttle)

### Performance Improvements
- Web Workers for wave calculations (if needed)
- Canvas offscreen rendering (if needed)
- Virtualize config tabs for large numbers
- Add loading states for initialization

---

## Contributing Guidelines

### Code Style
- Use TypeScript for type safety
- Follow existing component patterns
- Use Tailwind classes for styling
- Keep components focused and single-purpose
- Document complex algorithms

### File Organization
- Components in `lib/components/`
- Utilities in `lib/`
- Types in `types.ts`
- Constants in `constants.ts`

### Naming Conventions
- Components: PascalCase
- Functions: camelCase
- Constants: UPPER_SNAKE_CASE
- Types/Interfaces: PascalCase
- Files: camelCase or PascalCase for components
