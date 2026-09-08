import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // The linked workspace package is served from source (Vite resolves the symlink), so its
  // dependencies are only discovered when first imported. Late discovery triggers a second
  // optimisation pass that bundles a second copy of React, and every hook then throws
  // "Invalid hook call". Listing them up front makes the first pass see everything.
  // react-rnd is a dependency of win95-ui, so it is on this list for the same reason.
  optimizeDeps: {
    include: ['react', 'react-dom', '@react95/core', '@react95/icons', '@react95/clippy', 'react-rnd'],
  },
  // Belt and braces: force every import of react/react-dom to resolve to a single copy.
  resolve: { dedupe: ['react', 'react-dom'] },
  build: {
    rolldownOptions: {
      treeshake: {
        // @react95/icons ships 975 icons through one barrel and declares no "sideEffects" field,
        // so the bundler must keep all of them. Declaring the package side-effect-free lets it
        // drop every icon the catalog does not import. Without this the JS bundle is 3.8 MB.
        moduleSideEffects: (id) => !id.includes('@react95/icons'),
      },
    },
  },
  server: {
    port: 5173,
    // The .NET API runs on its own port in development. Proxying /api keeps the browser
    // same-origin, so there is no CORS to configure and fetch('/api/...') works unchanged
    // in production where the static host and the API sit behind one hostname.
    proxy: { '/api': { target: 'http://localhost:5080', changeOrigin: true } },
  },
})
