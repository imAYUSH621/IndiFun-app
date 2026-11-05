import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const target = process.env.API_URL || 'http://localhost:4000';
export default defineConfig({
  base: './',
  plugins: [react()],
  server: { port: 5174, proxy: { '/api': target, '/uploads': target, '/anims': target } },
});
