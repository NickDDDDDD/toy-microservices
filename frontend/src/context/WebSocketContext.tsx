import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type Message = {
  type: string;
  content: string;
  [key: string]: unknown;
};

type WebSocketContextType = {
  sendMessage: (data: Message) => void;
  lastMessage: Message | null;
  isConnected: boolean;
};

const WS_URL = import.meta.env.VITE_WS_URL;

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const socketRef = useRef<WebSocket | null>(null);
  const [lastMessage, setLastMessage] = useState<Message | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = new WebSocket(WS_URL);

    socket.onopen = () => {
      console.log("✅ WebSocket connected");
      setIsConnected(true);
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        setLastMessage(message);
        console.log("📩 Received:", message);
      } catch (e) {
        console.warn("Invalid JSON message received:", event.data, e);
      }
    };

    socket.onclose = () => {
      console.warn("❌ WebSocket closed");
      setIsConnected(false);
      // 可选: 自动重连逻辑
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socketRef.current = socket;

    return () => {
      socket.close();
    };
  }, []);

  const sendMessage = (data: Message) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(data));
    } else {
      console.warn("🚫 Cannot send message, WebSocket not open");
    }
  };

  return (
    <WebSocketContext.Provider
      value={{ sendMessage, lastMessage, isConnected }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within WebSocketProvider");
  }
  return context;
};
