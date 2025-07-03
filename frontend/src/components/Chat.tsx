// Chat.tsx
import { useState } from "react";
import { useChatWebSocket } from "../context/ChatWebSocketContext";
import { Container } from "./Container";
import { twMerge } from "tailwind-merge";
const Chat = () => {
  const { sendMessage, lastMessage, isConnected } = useChatWebSocket();
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
    <Container id="chat">
      <div className="relative m-auto flex aspect-[4/3] h-[50dvh] flex-col justify-center rounded-4xl bg-neutral-800 p-4 text-neutral-200">
        <header className="flex w-full items-center justify-between rounded-full bg-neutral-700 px-4 py-2">
          <h2>WebSocket Chat</h2>
          <div className="relative flex items-center">
            <span
              className={twMerge(
                "mr-2 h-3 w-3 rounded-full border-2 border-white",
                isConnected ? "bg-green-500" : "bg-red-500",
              )}
              title={isConnected ? "Connected" : "Disconnected"}
            />
            <span className="text-sm">
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
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
            className="flex-1 rounded-full bg-neutral-700 p-2 transition-all duration-300 focus:outline-none"
          />
          <button
            className="cursor-pointer rounded-full bg-neutral-700 p-2"
            onClick={handleSend}
          >
            Send Icon
          </button>
        </div>
      </div>
    </Container>
  );
};

export default Chat;
