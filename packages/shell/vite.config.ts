import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load env from root directory
  const env = loadEnv(mode, path.resolve(__dirname, '../..'), '');
  
  return {
    envDir: path.resolve(__dirname, '../..'),
    plugins: [
      react(),
      federation({
        name: 'shell',
        remotes: {
          authMFE: env.VITE_AUTH_MFE_URL || 'http://localhost:3001/assets/remoteEntry.js',
          staticMFE: env.VITE_STATIC_MFE_URL || 'http://localhost:3006/assets/remoteEntry.js',
          commentsMFE: env.VITE_COMMENTS_MFE_URL || 'http://localhost:3007/assets/remoteEntry.js',
          favoritesMFE: env.VITE_FAVORITES_MFE_URL || 'http://localhost:3005/assets/remoteEntry.js',
          catalogMFE: env.VITE_CATALOG_MFE_URL || 'http://localhost:3002/assets/remoteEntry.js',
          profileMFE: env.VITE_PROFILE_MFE_URL || 'http://localhost:3004/assets/remoteEntry.js',
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
      port: 5000,
      strictPort: true,
      cors: true,
    },
    preview: {
      port: 5000,
      strictPort: true,
    },
  };
});
