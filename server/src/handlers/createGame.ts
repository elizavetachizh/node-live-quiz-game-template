import { WebSocket } from "ws";
import { sendError, sendMessage } from "../ws/protocol.js";
import { CreateGameData } from "../types.js";
import crypto from "node:crypto";
import { gamesById, gameIdByCode, getUserBySocket } from "../state/store.js";
import { Game } from "../types.js";
import { generateRoomCode } from "../helpers/generateRoomCodeHelper.js";

export const handleCreateGame = (ws: WebSocket, data: CreateGameData): void => {
  if (!data || typeof data !== "object") {
    sendError(ws, "Invalid data");
    return;
  }
  const user = getUserBySocket(ws);
  if (!user) {
    sendError(ws, "User not found. Please register first");
    return;
  }

  const gameId = crypto.randomUUID();
  let code = generateRoomCode();

  while (gameIdByCode.has(code)) {
    code = generateRoomCode();
  }

  const questions = data.questions;

  if (!questions || questions.length === 0) {
    sendError(ws, "Invalid questions payload");
    return;
  }

  const validQuestions = questions.filter(
    (question) =>
      question.text &&
      question.options &&
      question.options.length === 4 &&
      question.correctIndex >= 0 &&
      question.correctIndex < question.options.length &&
      question.timeLimitSec > 0,
  );

  if (validQuestions.length !== questions.length) {
    sendError(ws, "Invalid questions payload");
    return;
  }

  const game: Game = {
    id: gameId,
    code: code,
    hostId: user.index,
    questions: validQuestions,
    players: [],
    currentQuestion: -1,
    status: "waiting",
    playerAnswers: new Map(),
  };

  gamesById.set(gameId, game);
  gameIdByCode.set(code, gameId);
  sendMessage(ws, "game_created", {
    gameId: gameId,
    code: code,
  });
};
