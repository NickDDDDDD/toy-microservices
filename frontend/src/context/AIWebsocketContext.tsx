import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export type Message<T = unknown> = {
  type: string;
  content: T;
  [key: string]: unknown;
};

type WebSocketContextType = {
  sendMessage: (data: Message) => void;
  lastMessage: Message | null;
  isConnected: boolean;
};

const WS_URL = import.meta.env.VITE_WS_URL_AI;

const AIWebSocketContext = createContext<WebSocketContextType | null>(null);

export const AIWebSocketProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const socketRef = useRef<WebSocket | null>(null);
  const pingIntervalRef = useRef<number | null>(null);

  const [lastMessage, setLastMessage] = useState<Message | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = new WebSocket(WS_URL);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("✅ [AI] WebSocket connected");
      setIsConnected(true);

      pingIntervalRef.current = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: "ping" }));
          console.log("📤 [AI] Sent: ping");
        }
      }, 10000);
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        if (message.type === "pong") {
          console.log("📥 [AI] Received: pong");
          return;
        }

        console.log("📩 [AI] Received:", message);
        setLastMessage(message);
      } catch (e) {
        console.warn("⚠️ [AI] Invalid JSON message:", event.data, e);
      }
    };

    socket.onclose = () => {
      console.warn("❌ [AI] WebSocket closed");
      setIsConnected(false);

      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }
    };

    socket.onerror = (error) => {
      console.error("💥 [AI] WebSocket error:", error);
    };

    return () => {
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }
      socket.close();
    };
  }, []);

  const sendMessage = (data: Message) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(data));
    } else {
      console.warn("🚫 [AI] Cannot send message, WebSocket not open");
    }
  };

  return (
    <AIWebSocketContext.Provider
      value={{ sendMessage, lastMessage, isConnected }}
    >
      {children}
    </AIWebSocketContext.Provider>
  );
};

export const useAIWebSocket = (): WebSocketContextType => {
  const context = useContext(AIWebSocketContext);
  if (!context) {
    throw new Error("useAIWebSocket must be used within AIWebSocketProvider");
  }
  return context;
};
