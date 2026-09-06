import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // The linked workspace package is served from source (Vite resolves the symlink), so its
  // dependencies are only discovered when first imported. Late discovery triggers a second
  // optimisation pass that bundles a second copy of React, and every hook then throws
  // "Invalid hook call". Listing them up front makes the first pass see everything.
  optimizeDeps: { include: ['react', 'react-dom', '@react95/core', '@react95/icons'] },
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
  server: { port: 5173 },
})
