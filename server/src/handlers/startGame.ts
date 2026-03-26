import { gamesById, getUserBySocket } from "../state/store";
import { StartGameData } from "../types";
import { sendError } from "../ws/protocol";
import { WebSocket } from "ws";
import { startQuestion } from "../services/questionFlowForStartGame";

export const handleStartGame = (ws: WebSocket, data: StartGameData): void => {
  if (!data || typeof data !== "object") {
    sendError(ws, "Invalid data");
    return;
  }

  const user = getUserBySocket(ws);
  if (!user) {
    sendError(ws, "User not found. Please register first");
    return;
  }

  const gameId = data.gameId;
  if (!gameId || typeof gameId !== "string") {
    sendError(ws, "Invalid game ID");
    return;
  }

  const game = gamesById.get(gameId);
  if (!game) {
    sendError(ws, "Game not found");
    return;
  }

  if (user.index !== game.hostId) {
    sendError(ws, "Only host can start the game");
    return;
  }

  if (game.status !== "waiting") {
    sendError(ws, "Game is not waiting for players");
    return;
  }

  if (game.questions.length === 0) {
    sendError(ws, "No questions in the game");
    return;
  }

  game.status = "in_progress";
  startQuestion(game, 0);
};
