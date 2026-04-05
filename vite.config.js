import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const asyncMainCssPlugin = () => ({
  name: 'async-main-css',
  enforce: 'post',
  transformIndexHtml(html) {
    return html.replace(
      /<link rel="stylesheet"([^>]*href="\/assets\/index-[^"]+\.css"[^>]*)>/g,
      '<link rel="preload" as="style"$1 onload="this.onload=null;this.rel=\'stylesheet\'"><noscript><link rel="stylesheet"$1></noscript>',
    )
  },
})

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), asyncMainCssPlugin()],
  server: {
    port: 3000,
    proxy: {
      '/ae-en/sitemap.xml': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/ae-ar/sitemap.xml': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/sitemap.xml': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Enable code splitting for better performance
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - separate large libraries
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['lucide-react', 'react-icons'],
          'vendor-forms': ['react-hook-form', 'react-select'],
          'vendor-utils': ['axios'],
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Enable minification (using esbuild - faster and built-in)
    minify: 'esbuild',
    esbuild: {
      drop: ['console', 'debugger'], // Remove console.logs and debugger in production
    },
    // Enable source maps for debugging (disable in production if needed)
    sourcemap: false,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios'],
  },
})
