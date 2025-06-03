import express from "express";
import http from "http";
import dotenv from "dotenv";
import { initMQProducer } from "./mq/producer";
import { startWebSocketServer } from "./ws/websocketServer";
import routes from "./routes";
import "./mq/consumer";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/", routes);

(async () => {
  try {
    await initMQProducer();

    const server = http.createServer(app);
    startWebSocketServer(server);

    server.listen(PORT, () => {
      console.log(`🚀 Chat Service running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Startup error:", err);
    process.exit(1);
  }
})();
