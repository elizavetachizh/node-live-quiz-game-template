import { handleAnswer } from "../handlers/answer";
import { handleCreateGame } from "../handlers/createGame";
import { handleJoinGame } from "../handlers/joinGame";
import { handleReg } from "../handlers/reg";
import { handleStartGame } from "../handlers/startGame";
import {
  AnswerData,
  CreateGameData,
  JoinGameData,
  RegData,
  StartGameData,
  WSMessage,
} from "../types";
import { sendError } from "./protocol";
import { WebSocket } from "ws";

export const routeMessage = (ws: WebSocket, parsedMessage: WSMessage) => {
  // Шаг 1: только каркас роутинга по type.
  // Реальную логику команд добавим по шагам (reg, create_game, join_game, ...).
  switch (parsedMessage.type) {
    case "reg":
      handleReg(ws, parsedMessage.data as RegData);
      break;
    case "create_game":
      handleCreateGame(ws, parsedMessage.data as CreateGameData);
      break;
    case "join_game":
      handleJoinGame(ws, parsedMessage.data as JoinGameData);
      break;
    case "start_game":
      handleStartGame(ws, parsedMessage.data as StartGameData);
      break;
    case "answer":
      handleAnswer(ws, parsedMessage.data as AnswerData);
      break;
    default:
      sendError(ws, `Unsupported message type: ${parsedMessage.type}`);
  }
};
