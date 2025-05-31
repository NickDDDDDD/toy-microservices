import { Client, type IMessage, type IFrame } from "@stomp/stompjs";

const client = new Client({
  brokerURL: "ws://localhost:15674/ws",
  connectHeaders: {
    login: "admin",
    passcode: "admin123",
  },
  debug: (str: string) => console.log("[STOMP]", str),
  onConnect: () => {
    console.log("✅ STOMP connected");
  },
  onStompError: (frame: IFrame) => {
    console.error("💥 STOMP error:", frame.headers["message"]);
    console.error("Details:", frame.body);
  },
});

export function connectStomp(): void {
  if (!client.active) client.activate();
}

export function subscribeToTopic(
  destination: string,
  callback: (msg: IMessage) => void,
): void {
  if (client.connected) {
    client.subscribe(destination, callback);
  } else {
    console.warn("⚠️ STOMP client not connected yet");
  }
}

export function sendMessage(destination: string, body: string): void {
  if (client.connected) {
    client.publish({ destination, body });
  } else {
    console.warn("⚠️ Cannot send message: STOMP client not connected");
  }
}
