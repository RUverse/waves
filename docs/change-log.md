# Change Log

## August 25, 2026
- Added npm trusted publishing that verifies and publishes the reviewed GitHub Release tarball through short-lived GitHub Actions OIDC credentials with automatic npm provenance

## August 15, 2026
- Added the publish-ready `@ruverse/waves` 0.1.0 ESM package with TypeScript declarations and zero runtime dependencies
- Added compact deterministic seeded configurations and persisted variation seeds for current and saved editor state
- Unified npm, editor preview, and self-contained embed rendering on the shared Canvas wave runtime
- Added responsive HiDPI mounting, partial updates, repeated-mount cleanup, reduced-motion support, offscreen pausing, and observer fallbacks
- Added package lifecycle and deterministic-rendering tests plus npm tarball verification
- Integrated four theme-aware wave background presets into the sibling Focus Tab extension with Off, Random, and pinned selection
- Added root `AGENTS.md` instructions for package boundaries, documentation, verification, and publishing safeguards
- Added a tag-driven `0.1.0` package workflow that validates, builds, tests, packs, smoke-tests, attests, and attaches the npm tarball to a draft GitHub Release without publishing it
- Moved local checkout paths and personal repository endpoints out of tracked documentation and configuration, with portable `.env.example` templates for contributors
- Moved the canonical repository to the `RUverse/waves` GitHub organization project and restored organization-owned npm repository, issue, and homepage metadata

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
