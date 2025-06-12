// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { WebSocketProvider } from "./context/WebSocketContext";
import { ContainerContextProvider } from "./context/ContainerContext.tsx";

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
  <WebSocketProvider>
    <ContainerContextProvider>
      <App />
    </ContainerContextProvider>
  </WebSocketProvider>,
  // </StrictMode>,
);
