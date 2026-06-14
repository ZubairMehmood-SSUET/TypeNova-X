import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  build: {
    // Target modern browsers — smaller, faster bundles
    target: 'es2020',

    // Warn when a chunk exceeds 600kb
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        // Manual chunk splitting for better cache efficiency
        manualChunks: {
          // React core — rarely changes
          'vendor-react': ['react', 'react-dom'],
          // Router — separate from react core
          'vendor-router': ['react-router-dom'],
          // Firebase Auth — large, cache separately
          'vendor-firebase': ['firebase/app', 'firebase/auth'],
        },
      },
    },

    // Minification
    minify: 'esbuild',

    // Source maps for error reporting in production
    sourcemap: false,
  },

  // Dev server config
  server: {
    port: 5173,
    open: false,
  },

  // Optimise deps pre-bundling
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
})
