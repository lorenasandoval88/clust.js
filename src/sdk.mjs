// ===============================
// DATASETS
// ===============================
export { default as irisData } from "./data/irisData.js";

// ===============================
// PLOTS
// ===============================
export { pca_plot, pca_UI } from "./pca.mjs";
export { tsne_plot, tsne_UI } from "./tsne.js";
export { umap_plot, umap_UI } from "./umap.js";
// export { heatmap_plot } from "./plots/heatmap.mjs";
// export { hclust_plot } from "./plots/hclust.mjs";
// optionally also export helpers
export * from "./otherFunctions.js";

// ===============================
// SDK METADATA
// ===============================
export const version = "0.1.0";

Application: 

NCI TDRP fellows are currently working on clustering embeddings using top-down approaches such as UMAP. UMAP projects data into 2D or 3D visualization, emphasizing local neighborhoods, nonlinear manifolds, and continuity between clusters.  With my SDK, I can perform hierarchical clustering on embeddings to retrieve cluster labels for UMAP coordinates and compare the results. 

This comparison can show whether hierarchical clusters remain spatially coherent in low-dimensional space, which clusters merge or fragment, and whether UMAP faithfully represents or distorts the underlying structure.