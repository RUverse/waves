# Waves

[Open Waves](https://waves.ruverse.ai/)

A deterministic animated-wave renderer and visual editor. The reusable renderer is published as `@ruverse/waves`; the Svelte app in this repository is its configuration and export UI.

## Package

Install the package:

```sh
npm install @ruverse/waves
```

Mount a wave into any sized element:

```js
import { createWaveConfig, mountWave } from '@ruverse/waves';

const config = createWaveConfig({
  seed: 42,
  waveCount: 7,
  amplitude: 52,
  backgroundColor: 'transparent',
  waveColor: 'rgba(255, 255, 255, 0.14)',
  variations: {
    amplitude: 0.2,
    rotation: 0.04,
    spacing: 0.08
  }
});

const handle = mountWave(document.querySelector('#waves'), config);

// Replace the configuration without creating another canvas.
handle.update({ ...config, seed: 84 });

// Remove the canvas and all listeners/animation work.
handle.destroy();
```

The container controls the rendered size and must have non-zero width and height. Configuration objects are JSON-safe, and the same configuration and seed always produce the same per-wave variations. The runtime has no dependencies, pauses while offscreen, respects reduced-motion preferences, and can be imported during server rendering as long as `mountWave()` is called only in the browser.

Build and test the publishable package:

```sh
bun run build:lib
bun run test:package
npm pack --dry-run
```

Version `0.1.0` is available from the public npm registry. Repository builds
prepare and attest release artifacts but do not publish them automatically.

## Releases

Package releases are prepared on `dev` and moved to the release-only `main`
branch through a release pull request. After the pull request is merged, an
exact numeric tag matching `package.json` triggers the GitHub Actions release
workflow.

The workflow runs the editor and package checks, creates and smoke-tests the npm
tarball, attests its provenance, and attaches it to a draft GitHub Release for
maintainer review. It does not publish to npm automatically. See
[`AGENTS.md`](./AGENTS.md) for the complete release procedure.

## Visual editor

The editor lets you customize amplitude, wavelength, frequency, period, rotation, curvature, glitch, spacing, thickness, taper, colors, variation, and wave count. Configurations can be saved locally or exported as an image or self-contained web embed.

## Run Locally

Prerequisites:

- Bun 1.3 or newer

Install dependencies:

```sh
bun install --frozen-lockfile
```

Start the development server:

```sh
bun run dev
```

Vite will print a local URL, usually `http://localhost:5173/`, where you can open the app in your browser.

To create a production build:

```sh
bun run build
```

To preview the production build locally:

```sh
bun run preview
```


## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Svelte](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode).

## Need an official Svelte framework?

Check out [SvelteKit](https://github.com/sveltejs/kit#readme), which is also powered by Vite. Deploy anywhere with its serverless-first approach and adapt to various platforms, with out of the box support for TypeScript, SCSS, and Less, and easily-added support for mdsvex, GraphQL, PostCSS, Tailwind CSS, and more.

## Technical considerations

**Why use this over SvelteKit?**

- It brings its own routing solution which might not be preferable for some users.
- It is first and foremost a framework that just happens to use Vite under the hood, not a Vite app.

This template contains as little as possible to get started with Vite + TypeScript + Svelte, while taking into account the developer experience with regards to HMR and intellisense. It demonstrates capabilities on par with the other `create-vite` templates and is a good starting point for beginners dipping their toes into a Vite + Svelte project.

Should you later need the extended capabilities and extensibility provided by SvelteKit, the template has been structured similarly to SvelteKit so that it is easy to migrate.

**Why `global.d.ts` instead of `compilerOptions.types` inside `jsconfig.json` or `tsconfig.json`?**

Setting `compilerOptions.types` shuts out all other types not explicitly listed in the configuration. Using triple-slash references keeps the default TypeScript setting of accepting type information from the entire workspace, while also adding `svelte` and `vite/client` type information.

**Why include `.vscode/extensions.json`?**

Other templates indirectly recommend extensions via the README, but this file allows VS Code to prompt the user to install the recommended extension upon opening the project.

**Why enable `allowJs` in the TS template?**

While `allowJs: false` would indeed prevent the use of `.js` files in the project, it does not prevent the use of JavaScript syntax in `.svelte` files. In addition, it would force `checkJs: false`, bringing the worst of both worlds: not being able to guarantee the entire codebase is TypeScript, and also having worse typechecking for the existing JavaScript. In addition, there are valid use cases in which a mixed codebase may be relevant.

**Why is HMR not preserving my local component state?**

HMR state preservation comes with a number of gotchas! It has been disabled by default in both `svelte-hmr` and `@sveltejs/vite-plugin-svelte` due to its often surprising behavior. You can read the details [here](https://github.com/rixo/svelte-hmr#svelte-hmr).

If you have state that's important to retain within a component, consider creating an external store which would not be replaced by HMR.

```ts
// store.ts
// An extremely simple external store
import { writable } from 'svelte/store'
export default writable(0)
```
