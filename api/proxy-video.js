/**
 * Vercel Serverless Function — Google Drive Video Proxy
 * 
 * Streams Google Drive video files through our own domain,
 * bypassing CORS, referrer checks, and third-party cookie blocks.
 * 
 * Usage: /api/proxy-video?id=GOOGLE_DRIVE_FILE_ID
 */

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
    return res.status(400).json({ error: 'Invalid or missing file ID' });
  }

  // Google Drive direct download URL (works server-side without referrer checks)
  const driveUrl = `https://drive.google.com/uc?export=download&id=${id}`;

  try {
    // 1. Initial request — Google may respond with a confirmation page for large files
    const initialRes = await fetch(driveUrl, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    // 2. Check if Google sent a virus-scan confirmation redirect (large files)
    const contentType = initialRes.headers.get('content-type') || '';
    
    if (contentType.includes('text/html')) {
      // Google is showing a "confirm download" page — extract the confirm token
      const html = await initialRes.text();
      const confirmMatch = html.match(/confirm=([0-9A-Za-z_-]+)/);
      const uuidMatch = html.match(/uuid=([0-9A-Za-z_-]+)/);
      
      let confirmUrl = `https://drive.google.com/uc?export=download&id=${id}`;
      if (confirmMatch) {
        confirmUrl += `&confirm=${confirmMatch[1]}`;
      }
      if (uuidMatch) {
        confirmUrl += `&uuid=${uuidMatch[1]}`;
      }

      const confirmedRes = await fetch(confirmUrl, {
        redirect: 'follow',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Cookie': initialRes.headers.get('set-cookie') || ''
        }
      });

      if (!confirmedRes.ok) {
        return res.status(confirmedRes.status).json({ error: 'Failed to fetch video from Google Drive' });
      }

      // Stream confirmed response
      const confirmedType = confirmedRes.headers.get('content-type') || 'video/mp4';
      const confirmedLength = confirmedRes.headers.get('content-length');

      res.setHeader('Content-Type', confirmedType);
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      if (confirmedLength) res.setHeader('Content-Length', confirmedLength);

      const reader = confirmedRes.body.getReader();
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

    // 3. Direct video response (small files) — stream it
    if (!initialRes.ok) {
      return res.status(initialRes.status).json({ error: 'Google Drive returned an error' });
    }

    const videoContentType = initialRes.headers.get('content-type') || 'video/mp4';
    const videoLength = initialRes.headers.get('content-length');

    res.setHeader('Content-Type', videoContentType);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    if (videoLength) res.setHeader('Content-Length', videoLength);

    const reader = initialRes.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(Buffer.from(value));
    }
    res.end();

  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(500).json({ error: 'Internal proxy error' });
  }
}
