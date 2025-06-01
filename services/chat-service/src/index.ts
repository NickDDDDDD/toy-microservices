import express from "express";
import chatRoutes from "./routes/chat";
import http from "http";
import { WebSocketServer } from "ws";
import { initMQProducer, sendToQueue } from "./mq/producer";
import "./mq/consumer";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/", chatRoutes);

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "chat-service",
    timestamp: new Date().toISOString(),
  });
});

(async () => {
  try {
    await initMQProducer();

    const server = http.createServer(app);

    const wss = new WebSocketServer({ server, path: "/ws/chat" });

    wss.on("connection", (socket, req) => {
      console.log("🟢 New WebSocket connection from", req.socket.remoteAddress);

      socket.send("👋 Welcome to chat-service!");

      socket.on("message", async (msg) => {
        try {
          await sendToQueue(msg.toString());
          socket.send("✅ sent to MQ");
        } catch (err) {
          socket.send("❌ failed to send to MQ");
        }
      });

      socket.on("close", () => {
        console.log("🔌 WebSocket disconnected");
      });
    });

    server.listen(PORT, () => {
      console.log(`🚀 Chat Service running on port ${PORT}`);
      console.log(`📋 Routes:`);
      console.log(`   - GET  /health`);
      console.log(`   - WS   /ws/chat`);
    });
  } catch (error) {
    console.error("❌ Failed to initialize MQ producer:", error);
    process.exit(1);
  }
  console.log("✅ MQ producer initialized");
})();
