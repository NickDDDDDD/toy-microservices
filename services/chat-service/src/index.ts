import express from "express";
import chatRoutes from "./routes/chat";
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

app.listen(PORT, () => {
  console.log(`🚀 Chat Service running on port ${PORT}`);
  console.log(`📋 Routes:`);
  console.log(`   - GET  /health`);
  console.log(`   - POST /send`);
});
