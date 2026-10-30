import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `npm run build` → normal site for Vercel (dist/).
// `npm run build:offline` → one self-contained HTML file you can double-click (offline/).
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), ...(mode === 'single' ? [viteSingleFile()] : [])],
  build: mode === 'single' ? { outDir: 'offline', assetsInlineLimit: 100000000, copyPublicDir: false } : {},
}));
