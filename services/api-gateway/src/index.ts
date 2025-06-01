// src/index.ts
import express from "express";
import cors from "cors";
import { createProxyMiddleware } from "http-proxy-middleware";
import http from "http";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use((req, res, next) => {
  if (!req.path.startsWith("/api/")) {
    express.json()(req, res, next);
  } else {
    next();
  }
});

// health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "API Gateway is running",
    timestamp: new Date().toISOString(),
  });
});

// Chat service proxy
const chatWSProxy = createProxyMiddleware({
  target: "ws://chat-service:3000",
  changeOrigin: true,
  ws: true,
  logger: console,
  on: {
    proxyReqWs: (proxyReq, req, socket, options, head) => {
      console.log(`[WS Proxy] Upgrade → ${req.url}`);
    },
    error: (err, req, res) => {
      console.error(`[WS Proxy Error] ${err.message}`);
    },
  },
});

app.use("/ws/chat", chatWSProxy);

// 404
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
  });
});

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`🚀 API gataway running on port ${PORT}`);
  console.log(`📋 Routes:`);
  console.log(`   - GET  /health`);
  console.log(`   - WS   /ws/chat`);
});
server.on("upgrade", chatWSProxy.upgrade);

export default app;
