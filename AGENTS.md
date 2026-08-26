# Ruwaves Repository Instructions

These instructions apply to the entire repository.

## Read first

- Read [`docs/prd.md`](./docs/prd.md) before changing product behavior.
- Read [`docs/technical.md`](./docs/technical.md) before changing rendering,
  persistence, exporting, or build boundaries.
- Check [`docs/change-log.md`](./docs/change-log.md) for recent behavior changes.
- When adding or materially changing a feature, update the PRD first, keep the
  technical documentation aligned, and add one concise change-log entry when
  the implementation is complete.

## Local environment

- Copy `.env.example` to `.env` and adjust it for the local checkout layout.
- Keep machine-specific paths, hostnames, account names, repository endpoints,
  and other workstation details only in `.env`, which is ignored by Git.
  Documentation and tracked configuration must use portable relative paths,
  organization-owned URLs, or environment variable names.

## Product and package boundaries

Ruwaves has two deliverables in one repository:

1. The Svelte visual editor and export application.
2. The framework-agnostic `@ruverse/waves` Canvas package.

- `src/package/index.ts` is the public package entry and browser runtime.
- `src/lib/waveMath.ts` is the shared rendering/math implementation.
- `src/embed/index.ts` is a compatibility wrapper for editor previews and
  self-contained exported snippets. Do not create a separate embed renderer.
- Keep the editor, image export, embed output, and npm package visually and
  mathematically consistent by routing them through shared math/runtime code.
- The Svelte app may use p5.js, but the published package must have zero runtime
  dependencies and must not expose p5.js, Svelte, editor state, UI toggles, or
  precomputed variation arrays.

## Public API invariants

- The supported package surface is `createWaveConfig`, `encodeWaveConfig`,
  `decodeWaveConfig`, `mountWave`, `DEFAULT_WAVE_CONFIG`, `WaveConfig`,
  `WaveConfigInput`, `WaveConfigString`, `WaveConfigSource`, and `WaveHandle`.
- Configuration objects must remain compact, JSON-safe, and deterministic. The
  same normalized configuration and seed must produce the same wave variations.
- Preserve canonical `waves:v1:` encoding and continue decoding v1 strings in
  future versions. String mounts and updates are complete snapshots; object
  updates remain partial merges. Keep `createWaveConfig()` object-only.
- Keep the `waves:v1:` omission and decoding defaults frozen inside the package
  codec and independent from editor UI constants. A v1 baseline change requires
  a new format prefix. `WaveConfigSource` intentionally accepts general strings;
  runtime decoding validates dynamic values from URLs, storage, and APIs.
- Persist `variationSeed` with editor state and saved configurations. Legacy
  configurations without a seed normalize to `0`.
- Package imports must remain SSR-safe: accessing browser globals is allowed
  only after `mountWave()` is called.
- Preserve responsive container sizing, HiDPI rendering, transparent
  backgrounds, multiple instances, safe repeated mounting, partial updates,
  idempotent destruction, offscreen pausing, and reduced-motion behavior.
- Keep `WaveConfig`, `WaveConfigString`, `WaveConfigSource`, `WaveHandle`, and
  generated declarations backward compatible within a released minor line.
  Treat public field removal or semantic changes as a versioned API change.
- Do not add CDN loading, telemetry, network access, global styles, or automatic
  host-element styling to the package runtime.

## Focus Tab integration

The Focus Tab repository consumes this package during local development through
a local file dependency. Set `FOCUS_TAB_DIR` in the ignored `.env` file to the
location of that checkout.

- Focus Tab owns its curated background preset names and values; the package
  owns configuration normalization and rendering.
- Focus Tab must bundle the renderer into extension output. Do not introduce
  remote code, CDN imports, new extension permissions, or CSP exceptions.
- Preserve the Off, Random, and pinned-preset behavior. Random selection is
  stable for the lifetime of one new-tab page.
- Wave backgrounds remain non-interactive, behind all content, transparent,
  theme-aware, and readable in both light and dark modes.
- After the required `@ruverse/waves` version is verified on npm, replace the
  sibling `file:` dependency with that compatible registry version; do not
  publish from an ordinary implementation task unless the user explicitly
  requests it.

## Generated files and publishing

- `dist/` is the editor production build and `lib-dist/` is the generated npm
  package build. `release/` contains generated package tarballs. All three are
  generated and must stay untracked.
- `npm pack`/`npm pack --dry-run` runs the `prepack` library build. Inspect the
  tarball contents before any release.
- The published package should contain only the library bundle, declarations,
  package metadata, README, and license.
- Never run `npm publish` unless the user explicitly requests publication and
  the package checks, packed-import smoke test, version, and npm authentication
  have all been verified.

## Preparing a package release

- Use `dev` as the integration branch and keep `main` release-only. Move a
  release from `dev` to `main` through a reviewed release pull request.
- Confirm the requested semantic version rather than guessing it. Update
  `package.json` with `npm version <version> --no-git-tag-version`, then run all
  checks and inspect the packed artifact before committing the version bump.
- After the release pull request is merged, tag the merged `main` commit with
  the exact package version and no `v` prefix. Pushing that tag triggers
  `.github/workflows/release.yml`.
- The workflow verifies the tag and package version, installs from the lockfile,
  checks the editor and package types, runs package tests, creates and
  smoke-tests the npm tarball, attests it, and attaches it to a draft GitHub
  Release.
- The workflow deliberately does not run `npm publish`. Review the draft and
  publish to npm only after the user explicitly requests that separate action.

## Commands and verification

Use Bun 1.3 or newer for this repository:

| Command | Purpose |
| --- | --- |
| `bun install --frozen-lockfile` | Install editor and package development dependencies |
| `bun run dev` | Run the visual editor locally |
| `bun run check` | Run Svelte and TypeScript checks for app and library |
| `bun run build` | Build the editor website into `dist/` |
| `bun run build:lib` | Build package ESM and declarations into `lib-dist/` |
| `bun run build:all` | Build both deliverables |
| `bun run test:package` | Build and run package normalization/lifecycle tests |
| `npm pack --dry-run` | Verify publishable package contents without publishing |

For changes that affect Focus Tab, also run from `$FOCUS_TAB_DIR` (configured in
the ignored `.env` file):

| Command | Purpose |
| --- | --- |
| `npm install` | Install esbuild and link the sibling package |
| `npm test` | Test setting normalization and preset inventory |
| `npm run build` | Build Chrome and Firefox unpacked directories and zip archives |

- Add tests at the narrowest useful layer. Rendering/runtime changes should
  cover deterministic seeds, normalization, updates, cleanup, reduced motion,
  observer fallbacks, and multiple instances where applicable.
- Run `git diff --check` before handoff.
- For visual changes, inspect `http://localhost:5173/` when the editor is
  already running; otherwise start it with `bun run dev`. For Focus Tab changes,
  inspect the built `dist/chrome/newtab.html` through a local server or load the
  unpacked extension. Verify dark/light modes, stacking, resizing, settings,
  reduced motion, and browser console output.
- Preserve unrelated working-tree changes and never use destructive Git cleanup
  commands.
