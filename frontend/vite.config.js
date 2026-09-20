import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Proxy error handler: when backend is down, return a clean 503 JSON
// so the frontend demo-mode fallback can detect it reliably.
function onProxyError(err, req, res) {
  if (!res.headersSent) {
    res.writeHead(503, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: 'Backend offline — running in demo mode.' }));
  }
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        onError: onProxyError,
      },
      '/mock': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        onError: onProxyError,
      }
    }
  }
})
