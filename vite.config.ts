import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base path. Defaults to root '/' so dev, preview, Vercel/Netlify and custom
// domains all resolve assets correctly out of the box.
// For GitHub Pages (served under /drive-your-summer/), build with:
//   VITE_BASE=/drive-your-summer/ npm run build
const base = process.env.VITE_BASE || '/'

export default defineConfig({
  base,
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsInlineLimit: 4096,
  },
})
