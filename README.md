# Welcome to clustJs!


Multivariate statistical visualization (PCA, t-SNE, UMAP, clustering, heatmaps, etc) in JavaScript. 

live at: https://lorenasandoval88.github.io/clustjs


## Getting Started

Use Clust.js either directly from the CDN (ES modules in the browser) or as an npm package in your app.

### CDN (ES Module)

Run in the browser console or inside an HTML `<script type="module">` block:

```javascript
// One‑liner
await (await import("https://lorenasandoval88.github.io/clustjs/dist/sdk.mjs"))
    .pca_plot({ width: 600, height: 400 })

// Step‑by‑step
const sdk = await import("https://lorenasandoval88.github.io/clustjs/dist/sdk.mjs")
await sdk.pca_plot({ data: sdk.irisData, divid: "myPCA", width: 600, height: 400 })
// UI helper
await sdk.pca_UI({ divid: "myPCA", width: 600, height: 300, loadIrisOnStart: true })
```

<img width="499" height="532" alt="image" src="https://github.com/user-attachments/assets/2739074d-12a4-4e5e-ae79-b96b68f73295" />


### npm (ESM)

Install and import in your application:

```bash
npm install clustjs
```

```javascript
import { pca_plot, pca_UI, irisData } from "clustjs";

await pca_plot({ data: irisData, divid: "myPCA", width: 600, height: 400 });
await pca_UI({ divid: "myPCA", width: 600, height: 300, loadIrisOnStart: true });
```

### Notes

- Browser/DOM required: `pca_plot` and `pca_UI` render to the DOM; use in browser apps (Vite, webpack, Next.js client components).
- ES modules: the SDK is ESM-only; ensure your bundler/runtime supports ESM imports.


Further documentation can be found on the [wiki](https://github.com/lorenasandoval88/clustjs/wiki).

## Project Structure

### Architecture

- `index.html`: browser demo shell and layout.
- `main.js`: demo app wiring (imports SDK from `./dist/sdk.mjs`, runs plots, console UI helpers).
- `src/`: reusable source modules for plots and helpers.
- `src/sdk.mjs`: public SDK source entrypoint (aggregates dataset + plot + utility exports).
- `src/data/`: built-in datasets (`irisData`, `spiralData`).
- `css/styles.css`: demo styling.
- `dist/`: Rollup output (`dist/sdk.mjs` + sourcemap).

### Build

Run `npm run build` to generate `dist/sdk.mjs` from `src/sdk.mjs`.

### Run

Open `index.html` with a local static server (for example VS Code Live Server). The demo script `main.js` loads the built SDK from `./dist/sdk.mjs`.

### SDK API

Public exports from `src/sdk.mjs`:

- Datasets: `irisData`, `spiralData`
- Plots/UI/state:
    - `hclust_plot`, `hclust_UI`, `hclustDt`
    - `pca_plot`, `pca_UI`, `pcaDt`
    - `tsne_plot`, `tsne_UI`, `tsneDt`
    - `umap_plot`, `umap_UI`, `umapDt`
    - `scatter_plot`, `scatter_UI`, `scatterDt`
    - `pairs_plot`, `pairs_UI`, `pairsDt`
    - `heatmap_plot`
- Utilities: all exports from `otherFunctions.js` (via `export *`)
- Metadata: `version`
