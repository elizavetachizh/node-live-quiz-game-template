import { handleCreateGame } from "../handlers/createGame";
import { handleJoinGame } from "../handlers/joinGame";
import { handleReg } from "../handlers/reg";
import { CreateGameData, JoinGameData, RegData, WSMessage } from "../types";
import { sendError } from "./protocol";
import { WebSocket } from "ws";

export const routeMessage = (ws: WebSocket, parsedMessage: WSMessage) => {
   // Шаг 1: только каркас роутинга по type.
    // Реальную логику команд добавим по шагам (reg, create_game, join_game, ...).
    switch (parsedMessage.type) {
        case 'reg':
          handleReg(ws, parsedMessage.data as RegData);
          break;
        case 'create_game':
          handleCreateGame(ws, parsedMessage.data as CreateGameData);
          break;
        case 'join_game':
            handleJoinGame(ws, parsedMessage.data as JoinGameData);
            break;
        case 'start_game':
        case 'answer':
          sendError(ws, `Command "${parsedMessage.type}" is not implemented yet`);
          break;
        default:
          sendError(ws, `Unsupported message type: ${parsedMessage.type}`);
      }
}