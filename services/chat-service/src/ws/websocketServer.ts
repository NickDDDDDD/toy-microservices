// src/ws/websocketServer.ts
import { WebSocketServer, WebSocket } from "ws";
import { sendToQueue } from "../mq/producer";
import http from "http";

const clients = new Set<WebSocket>();

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

  wss.on("connection", (socket, req) => {
    clients.add(socket);

    console.log("🟢 WS connected from", req.socket.remoteAddress);

    socket.send(JSON.stringify({ type: "system", content: "👋 Welcome" }));

    socket.on("message", async (msg) => {
      try {
        await sendToQueue(msg.toString());
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
