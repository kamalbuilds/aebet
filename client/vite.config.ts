/// <reference types="vitest" />
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    dedupe: ['vue'],
  },
  test: {
    include: ['./tests/**/*.test.ts'],
    globals: true,
    environment: 'happy-dom',
    env: {
      VITE_NODE_ENV: 'development',
      VITE_BOT_SERVICE_URL: 'http://localhost:3000',
      VITE_CLIENT_PORT: '8000',
      VITE_NODE_URL: 'http://localhost:3013',
      VITE_COMPILER_URL: 'http://localhost:3080',
      VITE_WS_URL: 'ws://localhost:3014/channel',
    },
  },
  server: {
    watch: {
      usePolling: true,
    },
    port: Number(process.env.PORT) || 8000,
  },
  build: {
    target: 'es2020',
  },
});