// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ChatWebSocketProvider } from "./context/ChatWebSocketContext.tsx";
import { AIWebSocketProvider } from "./context/AIWebsocketContext.tsx";
import { ContainerContextProvider } from "./context/ContainerContext.tsx";

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
  <AIWebSocketProvider>
    <ChatWebSocketProvider>
      <ContainerContextProvider>
        <App />
      </ContainerContextProvider>
    </ChatWebSocketProvider>
  </AIWebSocketProvider>,
  // </StrictMode>,
);
