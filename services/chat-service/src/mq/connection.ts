import amqp from "amqplib";

const connectRabbitMQ = async (
  retries = 5,
  delay = 3000
): Promise<amqp.ChannelModel> => {
  for (let i = 0; i < retries; i++) {
    try {
      const conn = await amqp.connect("amqp://admin:admin123@rabbitmq:5672");
      console.log("✅ Connected to RabbitMQ");
      return conn;
    } catch (err) {
      console.error(
        `❌ Failed to connect to RabbitMQ (attempt ${i + 1}/${retries})`
      );
      if (i === retries - 1) throw err;
      await new Promise((res) => setTimeout(res, delay));
    }
  }
  throw new Error("Max retry attempts reached");
};

export default connectRabbitMQ;
