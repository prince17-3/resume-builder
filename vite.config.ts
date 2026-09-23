import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // Load all env vars (including those without VITE_ prefix)
  const env = loadEnv(mode, process.cwd(), '');

  // Resolve the Gemini API key: prefer VITE_GEMINI_API_KEY, fall back to GEMINI_API_KEY
  const geminiKey = env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY || '';

  return {
    base: './',
    plugins: [react(), tailwindcss()],
    define: {
      // Expose the resolved key to client code as __GEMINI_API_KEY__
      __GEMINI_API_KEY__: JSON.stringify(geminiKey),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify — file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
