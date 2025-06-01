// src/index.ts
import express from "express";
import cors from "cors";
import { createProxyMiddleware } from "http-proxy-middleware";

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
const chatProxy = createProxyMiddleware({
  target: "http://chat-service:3000",
  changeOrigin: true,
  logger: console,
  on: {
    proxyReq: (proxyReq, req, res) => {
      console.log(`[Proxy] ${req.method} ${req.url} → ${proxyReq.path}`);
    },
    proxyRes: (proxyRes, req, res) => {
      console.log(`[Proxy Response] ${proxyRes.statusCode} from ${req.url}`);
    },
    error: (err, req, res) => {
      console.error(`[Proxy Error] ${err.message}`);
    },
  },
});

app.use("/api/chat", chatProxy);

// 404
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 API gataway running on port ${PORT}`);
  console.log(`📋 Routes:`);
  console.log(`   - GET  /health`);
  console.log(`   - POST api/chat/send`);
});

export default app;
