#!/usr/bin/env node

/**
 * Simple static file server for production deployment
 * Handles proper MIME types and security headers
 */

const http = require('http');
const path = require('path');
const fs = require('fs');
const url = require('url');

const PORT = process.env.PORT || 3000;
const DIST_DIR = path.join(__dirname, 'dist');

// MIME type mapping
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.jsx': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.txt': 'text/plain',
  '.xml': 'application/xml',
  '.webmanifest': 'application/manifest+json',
  '.manifest': 'application/manifest+json'
};

// Security headers
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=self',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https: wss:; media-src 'self' https: blob:;"
};

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

function serveFile(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
      return;
    }

    const contentType = getContentType(filePath);
    const headers = {
      'Content-Type': contentType,
      'Cache-Control': filePath.includes('/assets/') ? 'public, max-age=31536000' : 'public, max-age=3600',
      ...SECURITY_HEADERS
    };

    res.writeHead(200, headers);
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  let pathname = parsedUrl.pathname;

  // Handle root path
  if (pathname === '/') {
    pathname = '/index.html';
  }

  // Security: prevent directory traversal
  if (pathname.includes('..')) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Bad Request');
    return;
  }

  const filePath = path.join(DIST_DIR, pathname);

  // Check if file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // For SPA routing, serve index.html for non-API routes
      if (!pathname.startsWith('/api/') && !pathname.startsWith('/assets/')) {
        serveFile(path.join(DIST_DIR, 'index.html'), res);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      }
    } else {
      // Check if it's a directory
      fs.stat(filePath, (err, stats) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
          return;
        }

        if (stats.isDirectory()) {
          // Try to serve index.html from directory
          serveFile(path.join(filePath, 'index.html'), res);
        } else {
          serveFile(filePath, res);
        }
      });
    }
  });
});

server.listen(PORT, () => {
  console.log(`Static server running on port ${PORT}`);
  console.log(`Serving files from: ${DIST_DIR}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  server.close(() => {
    console.log('Server shut down');
    process.exit(0);
  });
});