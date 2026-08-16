import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiUrl = env.VITE_API_URL;

  let targetUrl = 'http://localhost:8000'; // local fallback
  let apiPath = '/api';

  try {
    if (apiUrl) {
      const url = new URL(apiUrl);
      targetUrl = `${url.protocol}//${url.host}`;
      apiPath = url.pathname.endsWith('/') ? url.pathname.slice(0, -1) : url.pathname;
    } else {
      console.warn("⚠️ VITE_API_URL is missing in .env file. Using local fallback.");
    }
  } catch (e) {
    console.error("⚠️ Invalid VITE_API_URL in .env file:", apiUrl);
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

