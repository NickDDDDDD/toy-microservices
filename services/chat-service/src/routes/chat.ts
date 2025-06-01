import { Router, Request, Response } from "express";
import amqp from "amqplib";
import connectRabbitMQ from "../mq/connection";

const router = Router();

router.post("/send", async (req: Request, res: Response) => {
  const { message } = req.body;
  if (!message) {
    res.status(400).json({ error: "Message is required" });
    return;
  }
  try {
    const conn = await connectRabbitMQ();
    const channel = await conn.createChannel();
    const queue = "chat-queue";
    await channel.assertQueue(queue);
    channel.sendToQueue(queue, Buffer.from(message));
    await channel.close();
    await conn.close();
    res.status(200).json({ status: "Message sent" });
  } catch (error) {
    console.error("Failed to send message to RabbitMQ:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

export default router;
