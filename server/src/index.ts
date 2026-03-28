import { WebSocketServer } from "ws";
import type { RawData } from "ws";
import type { WSMessage } from "./types";
import { sendError } from "./ws/protocol";
import { routeMessage } from "./ws/router";
import { handleDisconnect } from "./handlers/disconnect";

const PORT = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000;
const wss = new WebSocketServer({ port: PORT });

wss.on("connection", (ws) => {
  ws.on("message", (rawData: RawData) => {
    try {
      const parsedMessage = JSON.parse(rawData.toString()) as WSMessage;
      if (!parsedMessage) {
        sendError(ws, "Invalid JSON or message format");
        return;
      }
      routeMessage(ws, parsedMessage);
    } catch (error) {
      sendError(ws, "Invalid JSON or message format");
      return;
    }
  });

  ws.on("close", () => {
    handleDisconnect(ws);
    console.log("Client disconnected");
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

console.log(`WebSocket server started at ws://localhost:${PORT}`);
