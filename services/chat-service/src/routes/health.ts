import { Router } from "express";

const router = Router();

router.get("/health", (_, res) => {
  res.json({
    status: "OK",
    service: "chat-service",
    timestamp: new Date().toISOString(),
  });
});

export default router;
