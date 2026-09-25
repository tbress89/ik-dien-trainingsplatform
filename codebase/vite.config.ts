import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Production builds are served from GitHub Pages at https://tbress89.github.io/ik-dien-trainingsplatform/,
// so assets and routes live under that subfolder. The dev server keeps serving from the root.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/ik-dien-trainingsplatform/' : '/',
  plugins: [react()],
}));
