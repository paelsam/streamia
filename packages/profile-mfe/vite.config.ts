import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load env from root directory
  const env = loadEnv(mode, path.resolve(__dirname, '../..'), '');

  return {
    envDir: path.resolve(__dirname, '../..'),
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL || 'http://localhost:3000/api'),
    },
    plugins: [
      react(),
      federation({
        name: 'profileMFE',
        filename: 'remoteEntry.js',
        exposes: {
          './App': './src/App.tsx',
        },
        shared: ['react', 'react-dom', 'react-router-dom']
      })
    ],
    server: {
      port: 3004
    },
    preview: {
      port: 3004
    },
    build: {
      target: 'esnext',
      minify: false,
      cssCodeSplit: true
    }
  };
});
