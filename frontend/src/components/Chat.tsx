// Chat.tsx
import { useState } from "react";
import { useWebSocket } from "../context/WebSocketContext";
import { AIContainer } from "./Container";

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
    <AIContainer id="chat">
      <div className="relative m-auto flex aspect-[4/3] h-[50dvh] flex-col justify-center rounded-4xl bg-neutral-800 p-4 text-neutral-200">
        <header className="flex w-full items-center justify-between rounded-full bg-neutral-700 px-4 py-2">
          <h2>WebSocket Chat</h2>
          <p>Status: {isConnected ? "🟢 Connected" : "🔴 Disconnected"}</p>
        </header>
        <div className="flex w-full flex-1 flex-col justify-evenly gap-4">
          <p>Last message: {lastMessage?.content}</p>
        </div>
        <div className="flex w-full gap-2 rounded-full">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            className="flex-1 rounded-full bg-neutral-700 p-2 focus:outline-none"
          />
          <button
            className="cursor-pointer rounded-full bg-neutral-700 p-2"
            onClick={handleSend}
          >
            Send Icon
          </button>
        </div>
      </div>
    </AIContainer>
  );
};

export default Chat;
