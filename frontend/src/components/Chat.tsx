// Chat.tsx
import { useState } from "react";
import { useWebSocket } from "../context/WebSocketContext";

const Chat = () => {
  const { sendMessage, lastMessage, isConnected } = useWebSocket();
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    sendMessage({
      type: "chat",
      content: input.trim(),
    });

    setInput("");
  };

  return (
    <div className="flex h-full flex-col items-center justify-center p-4">
      <h2>WebSocket Chat</h2>
      <p>Status: {isConnected ? "🟢 Connected" : "🔴 Disconnected"}</p>

      <div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
        />
        <button
          className="cursor-pointer border-1 border-black"
          onClick={handleSend}
        >
          Send Message
        </button>
      </div>
      <p>Last message: {lastMessage?.content}</p>
    </div>
  );
};

export default Chat;
