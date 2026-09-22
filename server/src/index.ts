import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import os from 'os';
import fs from 'fs';
import { setupSocketEvents } from './socket/eventHandler';
import { getAllRooms, getPerformances } from './socket/roomManager';

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// Helper to get local network IPv4 address for mobile device connection
function getLocalIpAddress(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

const localIp = getLocalIpAddress();
const PORT = process.env.PORT || 4000;

// REST API Endpoints
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'VibeIt Socket.IO Server',
    time: Date.now(),
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/server-info', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'VibeIt Backend & Master Clock',
    localIp,
    port: Number(PORT),
    serverUrl: `http://${localIp}:${PORT}`,
    apkDownloadUrl: `http://${localIp}:${PORT}/download-apk`,
  });
});

app.get('/api/rooms', (_req, res) => {
  res.json({ rooms: getAllRooms() });
});

app.get('/api/performances', (_req, res) => {
  res.json({ performances: getPerformances() });
});

// Downloadable APK Handler
const apkPaths = [
  path.join(__dirname, '../../VibeIt.apk'),
  path.join(__dirname, '../../client/android/app/build/outputs/apk/debug/app-debug.apk'),
];

function handleApkDownload(_req: express.Request, res: express.Response) {
  for (const candidate of apkPaths) {
    if (fs.existsSync(candidate)) {
      res.setHeader('Content-Type', 'application/vnd.android.package-archive');
      res.setHeader('Content-Disposition', 'attachment; filename="VibeIt.apk"');
      return res.sendFile(candidate);
    }
  }
  return res.status(404).send('APK file not found. Please build the APK first with npm run build:apk');
}

app.get('/download-apk', handleApkDownload);
app.get('/VibeIt.apk', handleApkDownload);

// Serve compiled web frontend static assets
const clientDistPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/download-apk') || req.path.endsWith('.apk')) {
    return next();
  }
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

setupSocketEvents(io);

server.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`🎸 VibeIt Master Server & Web App is LIVE!`);
  console.log(`💻 Local access:      http://localhost:${PORT}`);
  console.log(`📱 Mobile Wi-Fi URL:  http://${localIp}:${PORT}`);
  console.log(`📦 Download APK link: http://${localIp}:${PORT}/download-apk`);
  console.log(`======================================================\n`);
});

