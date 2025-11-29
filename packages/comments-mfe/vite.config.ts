import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'commentsMFE',
      filename: 'remoteEntry.js',
      exposes: {
         "./mount": "./src/main.tsx",
        // Expón otros componentes si es necesario
        // './MovieList': './src/components/MovieList.tsx',
      },
      shared: ['react', 'react-dom', 'react-router-dom'],
    }),
  ],
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
  server: {
    port: 3007,  // Puerto único para este MFE
  },
  preview: {
    port: 3007,
  },
});