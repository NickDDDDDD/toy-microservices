import amqp from "amqplib";
import connectRabbitMQ from "../mq/connection";
import { broadcastMessage } from "../ws/websocketServer";

(async () => {
  const connection: amqp.ChannelModel = await connectRabbitMQ();
  const channel = await connection.createChannel();
  const queue = "chat-queue";
  await channel.assertQueue(queue);

  console.log(`🚨 Waiting for messages in ${queue}`);

  channel.consume(queue, (msg) => {
    if (msg !== null) {
      const content = msg.content.toString();
      console.log(`📰 Received:`, content);
      broadcastMessage(content);
      console.log(`✅ Broadcasted to WebSocket clients`);
      channel.ack(msg);
    }
  });
})();
