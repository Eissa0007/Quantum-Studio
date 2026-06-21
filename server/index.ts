import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { Server } from '@hocuspocus/server';

const app = express();
const server = createServer(app);

// CORS and basic middleware
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Setup Hocuspocus Server for Yjs collaboration
const hocuspocus = Server.configure({
  name: 'quantum-studio-collab',
  async onConnect(data) {
    console.log(`Connecting internally: ${data.requestHeaders.host}`);
  },
});

// Create WebSocket server explicitly to bind onto our Express server
const wss = new WebSocketServer({ noServer: true });

// Handle upgrade requests for WebSocket
server.on('upgrade', (request, socket, head) => {
  if (request.url?.startsWith('/collab')) {
    wss.handleUpgrade(request, socket, head, (ws) => {
      // Hocuspocus takes over this WebSocket connection
      hocuspocus.handleConnection(ws, request);
    });
  } else {
    socket.destroy();
  }
});

// STRICT REQUIREMENT: Listen ONLY on localhost:3001
const PORT = 3001;
const HOST = '127.0.0.1';

server.listen(PORT, HOST, () => {
  console.log(`Internal Collab Server running on http://${HOST}:${PORT}`);
  console.log(`WebSocket path ready at ws://${HOST}:${PORT}/collab`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await hocuspocus.destroy();
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  await hocuspocus.destroy();
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
