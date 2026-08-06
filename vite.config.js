import { defineConfig } from 'vite';

import react from '@vitejs/plugin-react';
const projectIsOnWindowsMount = process.platform === 'linux' && process.cwd().startsWith('/mnt/');

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    open: true,
    watch: projectIsOnWindowsMount
      ? {
          usePolling: true,
          interval: 100,
        }
      : undefined,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    strictPort: true,
  },
  build: {
    outDir: 'dist', // cartella di output
    sourcemap: true, // abilita la generazione delle source map
  },
});
