# Product Requirements Document: Ruwaves

## Overview
Ruwaves is a visual wave generation and manipulation tool that creates beautiful, animated wave patterns on screen. Users can customize wave properties in real-time and save their favorite configurations for later use.

---

## Core Features

### 1. Wave Visualization

#### 1.1 Real-Time Wave Display
- Displays multiple animated waves that flow continuously across the screen
- Waves animate smoothly with natural, fluid motion
- Visual output fills the entire viewport for an immersive experience
- Each wave moves independently based on its configuration

#### 1.2 Multiple Wave Support
- Display between 1 and 20 simultaneous waves
- Each wave has unique characteristics generated from a random seed
- Waves are evenly distributed across the screen
- All waves respond to global parameter changes while maintaining individual variations

---

### 2. Wave Parameters

Users can adjust six key parameters that control wave behavior and appearance:

#### 2.1 Amplitude
- Controls the height/intensity of wave oscillations
- Range: -60 to 140 units
- Default: 40 units
- Can be enabled/disabled independently

#### 2.2 Wavelength
- Controls the horizontal stretch/compression of waves
- Range: -0.08 to 0.12
- Default: 0.02
- Can be enabled/disabled independently

#### 2.3 Frequency
- Controls the speed of wave oscillation over time
- Range: -0.3 to 1.3
- Default: 0.5
- Can be enabled/disabled independently

#### 2.4 Period
- Controls the temporal rhythm of wave motion
- Range: -0.03 to 0.13
- Default: 0.05
- Can be enabled/disabled independently

#### 2.5 Spacing
- Controls the distance between individual waves
- Range: 0.3 to 3.0
- Default: 1.0 (normal spacing)
- Can be enabled/disabled independently

#### 2.6 Wave Count
- Controls how many waves are displayed simultaneously
- Range: 1 to 20 waves
- Default: 5 waves
- Can be enabled/disabled independently

---

### 3. Control Panel

#### 3.1 Panel Display
- Collapsible control panel positioned at the bottom-left of the screen
- Semi-transparent design that doesn't obstruct the wave view
- Collapse button integrated with action buttons (right side with spacing)
- Menu button appears when panel is hidden to reopen it
- Keyboard shortcut: Spacebar to toggle panel visibility

#### 3.2 Parameter Controls
- Each parameter has three components:
  - **Toggle Switch**: Enable/disable the parameter's effect
  - **Label**: Clear identification of the parameter
  - **Slider**: Adjust the parameter value within its range
- All controls update the waves in real-time as adjustments are made
- Visual feedback shows current values

---

### 4. Configuration Management

#### 4.1 Saving Configurations
- **Save Button**: Saves the current wave configuration
  - Creates a new configuration if none is active
  - Updates the existing configuration if one is selected
- **Save as New Button**: Always creates a new configuration (appears when a configuration is active)
  - Allows creating variations of existing configurations
  - Generates a unique identifier for each saved configuration

#### 4.2 Configuration Tabs
- Saved configurations appear as tabs above the control panel
- Each tab displays:
  - Configuration name (auto-generated timestamp-based name)
  - Visual indicator when the tab is active
  - Yellow dot indicator when current settings differ from saved configuration
  - Close button (×) to delete the configuration
- Click a tab to load its saved configuration
- Hover to see full configuration details (name and timestamp)

#### 4.3 Configuration Persistence
- All saved configurations persist across browser sessions
- Current parameter values and panel state are automatically saved
- Application restores previous state when reopened

---

### 5. Action Buttons

#### 5.1 Reset Seed
- Generates new random variations for all waves
- Maintains current parameter settings
- Creates completely new wave patterns with different characteristics
- Icon: Shuffle/random symbol

#### 5.2 Reset Config
- Restores all parameters to their default values
- Resets all toggles to default states (only amplitude enabled)
- Generates new random seed for waves
- Clears any active configuration selection
- Icon: Circular arrow (reset symbol)

#### 5.3 Save Config
- Saves the current wave configuration
- Updates existing configuration if one is active
- Icon: Save/floppy disk symbol

#### 5.4 Save as New Config (conditional)
- Appears only when a configuration is active
- Creates a new configuration variant
- Icon: Save with plus symbol

#### 5.5 Settings
- Opens settings modal with configuration options
- Currently includes toggle for showing/hiding slider values
- Icon: Gear/settings symbol

#### 5.6 Export
- Opens export modal for exporting configurations
- Export functionality to be implemented
- Icon: Download/arrow down symbol

---

### 6. User Interface Features

#### 6.1 Visual Feedback
- Active configuration tab is highlighted with brighter border and bold text
- Unsaved changes indicator on active configuration
- Hover effects on interactive elements
- Smooth transitions when toggling panel visibility

#### 6.2 Tooltips
- All action buttons display descriptive tooltips on hover:
  - "Reset Seed"
  - "Reset Config"
  - "Save config"
  - "Save as new config"
  - "Settings"
  - "Export"
  - "Delete wave" (on configuration tabs)

#### 6.3 Responsive Design
- Adapts to different screen sizes
- Waves automatically adjust to viewport dimensions
- Control panel maintains readability at various sizes

---

## User Workflows

### Creating a New Wave Pattern
1. Open the application (control panel shown by default)
2. Adjust parameters using sliders
3. Toggle parameters on/off to see different effects
4. Use "Reset Seed" to try different random variations
5. When satisfied, click the save button
6. Configuration is saved and becomes the active tab

### Editing an Existing Configuration
1. Click on a saved configuration tab
2. Adjust parameters as desired
3. Yellow indicator appears showing unsaved changes
4. Click save button to update the configuration
5. OR click "Save as New" to create a new configuration variant

### Exploring Different Configurations
1. Click through saved configuration tabs
2. Each tab loads its saved settings instantly
3. Compare different wave patterns
4. Delete unwanted configurations using the × button

### Starting Fresh
1. Click "Reset Config" to restore defaults
2. OR manually adjust all parameters
3. Use "Reset Seed" to generate new random variations
4. Create new configurations from scratch

---

## Design Principles

### Simplicity
- Minimal interface that doesn't distract from the wave visualization
- Clear, intuitive controls with immediate visual feedback
- Collapsible panel to maximize viewing area

### Real-Time Interaction
- All changes apply instantly
- Smooth animations and transitions
- No loading states or delays

### Persistence
- Automatic state saving
- No manual save required for general usage
- Configurations persist across sessions

### Flexibility
- Multiple ways to create and manage configurations
- Independent parameter control
- Non-destructive editing (save as new option)

---

## Success Metrics

### Usability
- Users can create and save their first configuration within 2 minutes
- Configuration switching is instant and intuitive
- Parameter adjustments produce immediate, visible results

### Engagement
- Users create multiple saved configurations
- Users return to explore saved configurations
- Users experiment with parameter combinations

### Reliability
- Configurations persist across browser sessions
- No data loss when closing/reopening the application
- Smooth performance with up to 20 waves displayed

---

## Future Enhancements (Out of Scope for v1)

- Custom naming for saved configurations
- Export configurations as shareable codes
- Color customization options
- Different wave types (sine, square, triangle, etc.)
- Audio reactivity
- Animation recording/export
- Preset configuration library
- Configuration sorting and organization
- Undo/redo functionality
