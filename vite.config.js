import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // Direktori output untuk file hasil build
  },
  base: '/style/', // Penting untuk subpath di GitHub Pages
});

