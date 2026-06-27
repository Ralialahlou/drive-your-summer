import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base path: GitHub Pages serves the repo under /drive-your-summer/.
// Override with VITE_BASE=/ for Vercel/Netlify root deploys.
const base = process.env.VITE_BASE || '/drive-your-summer/'

export default defineConfig({
  base,
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsInlineLimit: 4096,
  },
})
