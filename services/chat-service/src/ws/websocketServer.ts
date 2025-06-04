// src/ws/websocketServer.ts
import { WebSocketServer, WebSocket } from "ws";
import { sendToQueue } from "../mq/producer";
import http from "http";

interface TrackedSocket extends WebSocket {
  lastSeen: number;
}

const clients = new Set<TrackedSocket>();

export const broadcastMessage = (data: any) => {
  const message = typeof data === "string" ? data : JSON.stringify(data);

  for (const client of clients) {
    if (client.readyState === client.OPEN) {
      client.send(message);
    }
  }
};
export const startWebSocketServer = (server: http.Server) => {
  const wss = new WebSocketServer({ server, path: "/ws/chat" });

  wss.on("connection", (rawSocket, req) => {
    const socket = rawSocket as TrackedSocket;
    socket.lastSeen = Date.now();

    clients.add(socket);

    console.log("🟢 WS connected from", req.socket.remoteAddress);

    socket.send(JSON.stringify({ type: "system", content: "👋 Welcome" }));

    socket.on("message", async (raw) => {
      socket.lastSeen = Date.now();

      try {
        const msg = raw.toString();
        const parsed = JSON.parse(msg);

        if (parsed.type === "ping") {
          console.log("📥 Received: ping");
          socket.send(JSON.stringify({ type: "pong" }));
          console.log("📤 Sent: pong");
          return;
        }

        await sendToQueue(msg);
        socket.send(JSON.stringify({ type: "ack", content: "✅ sent to MQ" }));
      } catch {
        socket.send(
          JSON.stringify({ type: "error", content: "❌ failed to send" })
        );
      }
    });

    socket.on("close", () => {
      clients.delete(socket);
      console.log("🔌 WS disconnected");
    });
  });

  console.log("✅ WebSocket server started");
};

const HEARTBEAT_INTERVAL = 10000;
const HEARTBEAT_TIMEOUT = 30000;

setInterval(() => {
  const now = Date.now();
  for (const client of clients) {
    if (now - client.lastSeen > HEARTBEAT_TIMEOUT) {
      console.warn("⚠️ Stale connection. Terminating.");
      client.terminate();
      clients.delete(client);
    }
  }
}, HEARTBEAT_INTERVAL);
