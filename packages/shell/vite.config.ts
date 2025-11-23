import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'shell',
      remotes: {
        authMFE: process.env.VITE_AUTH_MFE_URL || 'http://localhost:3001/assets/remoteEntry.js',
        // Add more microfrontends here as they are created
        // catalogMFE: process.env.VITE_CATALOG_MFE_URL || 'http://localhost:3002/assets/remoteEntry.js',
        // playerMFE: process.env.VITE_PLAYER_MFE_URL || 'http://localhost:3003/assets/remoteEntry.js',
      },
      shared: {
        react: '^19.2.0',
        'react-dom': '^19.2.0',
        'react-router-dom': '^7.9.4',
      },
    }),
  ],
  resolve: {
    alias: {
      '@streamia/shared': path.resolve(__dirname, '../shared/src'),
    },
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssCodeSplit: false,
    modulePreload: false,
    rollupOptions: {
      output: {
        format: 'esm',
        manualChunks: undefined,
      },
    },
  },
  server: {
    port: 3000,
    strictPort: true,
    cors: true,
  },
  preview: {
    port: 3000,
    strictPort: true,
  },
});
