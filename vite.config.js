import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false,   // if 5173 is taken, try 5174, 5175 etc automatically
    host: 'localhost',   // use 'localhost' not '::1' (IPv6) — fixes Windows EACCES
  },
  preview: {
    port: 4173,
    strictPort: false,
  },
})
