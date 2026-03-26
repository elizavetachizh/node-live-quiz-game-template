import { finishQuestion } from "../services/questionFlowForStartGame";
import { gamesById, getUserBySocket } from "../state/store";
import { AnswerData } from "../types";
import { sendError, sendMessage } from "../ws/protocol";
import { WebSocket } from "ws";

export const handleAnswer = (ws: WebSocket, data: AnswerData): void => {
  if (!data || typeof data !== "object") {
    sendError(ws, "Invalid data");
    return;
  }
  const gameId = data.gameId;

  if (!gameId || typeof gameId !== "string") {
    sendError(ws, "Invalid game ID");
    return;
  }

  const user = getUserBySocket(ws);
  if (!user) {
    sendError(ws, "User not found. Please register first");
    return;
  }

  const questionIndex = data.questionIndex;
  const answerIndex = data.answerIndex;
  if (typeof questionIndex !== "number" || !Number.isInteger(questionIndex)) {
    sendError(ws, "Invalid question index");
    return;
  }
  if (typeof answerIndex !== "number" || !Number.isInteger(answerIndex)) {
    sendError(ws, "Invalid answer index");
    return;
  }

  const game = gamesById.get(gameId);
  if (!game) {
    sendError(ws, "Game not found");
    return;
  }

  if (user.index === game.hostId) {
    sendError(ws, "Host cannot submit answers");
    return;
  }

  if (game.status !== "in_progress") {
    sendError(ws, "Game is not in progress");
    return;
  }
  if (questionIndex !== game.currentQuestion) {
    sendError(ws, "Invalid question index");
    return;
  }

  if (answerIndex < 0 || answerIndex > 3) {
    sendError(ws, "Invalid answer index");
    return;
  }

  if (game.players.length === 0) {
    sendError(ws, "No players in the game");
    return;
  }

  const foundedPlayer = game.players.find(
    (player) => player.index === user.index,
  );
  if (!foundedPlayer) {
    sendError(ws, "Player not found");
    return;
  }
  const playerAnswer = game.playerAnswers.has(foundedPlayer.index);
  if (playerAnswer) {
    sendError(ws, "Player already answered");
    return;
  }
  game.playerAnswers.set(foundedPlayer.index, {
    answerIndex: data.answerIndex,
    timestamp: Date.now(),
  });
  sendMessage(ws, "answer_accepted", {
    questionIndex: data.questionIndex,
  });

  const allPlayersAnswered = game.players.every((player) =>
    game.playerAnswers.has(player.index),
  );
  if (allPlayersAnswered) {
    finishQuestion(game);
  }
};
