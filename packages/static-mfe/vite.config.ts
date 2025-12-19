import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';
import path from 'path';

export default defineConfig({
  envDir: path.resolve(__dirname, '../..'),
  plugins: [
    react(),
    federation({
      name: 'staticMFE',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App',
        './HomePage': './src/pages/HomePage',
        './AboutPage': './src/pages/AboutPage',
        './ContactPage': './src/pages/ContactPage',
        './ManualPage': './src/pages/ManualPage',
        './SitemapPage': './src/pages/SitemapPage',
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: '^19.2.0',
        },
        'react-dom': {
          singleton: true,
          requiredVersion: '^19.2.0',
        },
        'react-router-dom': {
          singleton: true,
          requiredVersion: '^7.9.4',
        },
      } as any,
    }),
  ],
  resolve: {
    alias: {
      '@streamia/shared': path.resolve(__dirname, '../shared/src'),
    },
  },
  server: {
    port: 3006,
    cors: true,
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssCodeSplit: false,
    modulePreload: false,
    rollupOptions: {
      output: {
        format: 'esm',
      },
    },
  },
});
