import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';
import path from 'path';

export default defineConfig({
  envDir: path.resolve(__dirname, '../..'),
  plugins: [
    react(),
    federation({
      name: 'commentsMFE',
      filename: 'remoteEntry.js',
      exposes: {
        "./App": "./src/App.tsx",
        "./mount": "./src/main.tsx",
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
  server: {
    port: 3007,
    cors: true,
  },
  preview: {
    port: 3007,
  },
});