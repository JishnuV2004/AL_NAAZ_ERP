import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiUrl = env.VITE_API_URL || '';
  
  let targetUrl = 'https://al-naaz.onrender.com';
  let apiPath = '/api';

  try {
    const url = new URL(apiUrl);
    targetUrl = `${url.protocol}//${url.host}`;
    apiPath = url.pathname.endsWith('/') ? url.pathname.slice(0, -1) : url.pathname;
  } catch (e) {
    // Fallback if URL is invalid
  }

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        [apiPath]: {
          target: targetUrl,
          changeOrigin: true,
          secure: false,
          timeout: 60000,
          proxyTimeout: 60000,
        }
      }
    }
  }
})

