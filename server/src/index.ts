import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { WebSocketServer } from "ws";

// Загружаем server/.env независимо от cwd (например, при npm run start из корня репозитория)
dotenv.config({
  path: path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../.env",
  ),
});
import type { RawData } from "ws";
import type { WSMessage } from "./types.js";
import { sendError } from "./ws/protocol.js";
import { routeMessage } from "./ws/router.js";
import { handleDisconnect } from "./handlers/disconnect.js";

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
