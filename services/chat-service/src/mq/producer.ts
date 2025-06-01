// producer.ts
import amqp, { Channel } from "amqplib";
import connectRabbitMQ from "./connection";

let channel: Channel;

export async function initMQProducer() {
  const conn = await connectRabbitMQ();
  channel = await conn.createChannel();
  await channel.assertQueue("chat-queue");
  console.log("✅ MQ producer connected");
}

export async function sendToQueue(message: string) {
  if (!channel) throw new Error("MQ channel not initialized");
  channel.sendToQueue("chat-queue", Buffer.from(message));
  console.log(`✅ Message sent to queue: ${message}`);
}
