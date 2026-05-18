import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Local dev middleware to proxy Google Drive videos (mirrors api/proxy-video.js on Vercel)
function driveVideoProxy() {
  return {
    name: 'drive-video-proxy',
    configureServer(server) {
      server.middlewares.use('/api/proxy-video', async (req, res) => {
        const url = new URL(req.url, 'http://localhost');
        const id = url.searchParams.get('id');

        if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'Invalid file ID' }));
          return;
        }

        try {
          const driveUrl = `https://drive.google.com/uc?export=download&id=${id}`;
          const initial = await fetch(driveUrl, {
            redirect: 'follow',
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
          });

          const ct = initial.headers.get('content-type') || '';

          // Handle Google's virus-scan confirmation page for large files
          if (ct.includes('text/html')) {
            const html = await initial.text();
            const confirmMatch = html.match(/confirm=([0-9A-Za-z_-]+)/);
            const uuidMatch = html.match(/uuid=([0-9A-Za-z_-]+)/);

            let confirmUrl = `https://drive.google.com/uc?export=download&id=${id}`;
            if (confirmMatch) confirmUrl += `&confirm=${confirmMatch[1]}`;
            if (uuidMatch) confirmUrl += `&uuid=${uuidMatch[1]}`;

            const confirmed = await fetch(confirmUrl, {
              redirect: 'follow',
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Cookie': initial.headers.get('set-cookie') || ''
              }
            });

            if (!confirmed.ok) {
              res.statusCode = confirmed.status;
              res.end(JSON.stringify({ error: 'Drive fetch failed' }));
              return;
            }

            res.setHeader('Content-Type', confirmed.headers.get('content-type') || 'video/mp4');
            res.setHeader('Accept-Ranges', 'bytes');
            res.setHeader('Cache-Control', 'public, max-age=3600');
            const len = confirmed.headers.get('content-length');
            if (len) res.setHeader('Content-Length', len);

            const reader = confirmed.body.getReader();
            const pump = async () => {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                res.write(Buffer.from(value));
              }
              res.end();
            };
            return pump();
          }

          // Direct response (small files)
          if (!initial.ok) {
            res.statusCode = initial.status;
            res.end(JSON.stringify({ error: 'Drive returned error' }));
            return;
          }

          res.setHeader('Content-Type', initial.headers.get('content-type') || 'video/mp4');
          res.setHeader('Accept-Ranges', 'bytes');
          res.setHeader('Cache-Control', 'public, max-age=3600');
          const len = initial.headers.get('content-length');
          if (len) res.setHeader('Content-Length', len);

          const reader = initial.body.getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            res.write(Buffer.from(value));
          }
          res.end();
        } catch (err) {
          console.error('Drive proxy error:', err);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Proxy error' }));
        }
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    driveVideoProxy(),
  ],
  server: {
    host: true,
  }
})
