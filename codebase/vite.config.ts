import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Production builds are served from GitHub Pages on the custom domain https://trainingen.ikdien.be/,
// so assets and routes live at the root, just like on the dev server.
export default defineConfig({
  base: '/',
  plugins: [react()],
});
