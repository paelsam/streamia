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
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL || 'https://stremiaserver.onrender.com/api'),
    },
    plugins: [
      react(),
      federation({
        name: 'playerMFE',
        filename: 'remoteEntry.js',
        exposes: {
          './App': './src/App',
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
      port: 3003,
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
  };
});
