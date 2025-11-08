# Change Log

## November 3, 2025
- Added bold text styling to active saved configuration tab for better visual indication of which config is currently selected
- Reorganized panel toggle buttons: collapse button now appears on the left side of action buttons with spacing, menu button only shows when panel is hidden
- Moved config tabs inside control panel component so they slide together with the panel
- Moved and renamed title from "ruwaves" to "waves", positioned above config tabs
- Added Settings button that opens a modal with toggle to enable/disable display of exact numbers beside sliders
- Implemented slider value display: when enabled in settings, white text showing exact values appears next to each slider
- Settings are now persisted in localStorage and restored on app reload
- Added Export button that opens an export modal with export functionality (placeholder for future implementation)
- Added color pickers for wave color and background color with default constants (white and black respectively)
- Colors are persisted in localStorage and applied in real-time to the wave visualization
- Reset Config button now also resets colors to their default values