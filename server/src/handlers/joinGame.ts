import {
  broadcastPlayerJoined,
  broadcastUpdatePlayers,
  gameIdByCode,
  gamesById,
  getUserBySocket,
  socketToUserId,
} from "../state/store.js";
import { JoinGameData, Player } from "../types.js";
import { sendError, sendMessage } from "../ws/protocol.js";
import { WebSocket } from "ws";

export const handleJoinGame = (ws: WebSocket, data: JoinGameData) => {
  if (!data || typeof data !== "object") {
    sendError(ws, "Invalid data");
    return;
  }
  const user = getUserBySocket(ws);
  if (!user) {
    sendError(ws, "User not found. Please register first");
    return;
  }
  const code = data.code?.trim().toUpperCase();
  if (!code || typeof code !== "string" || code.length !== 6) {
    sendError(ws, "Invalid roomcode");
    return;
  }
  const gameId = gameIdByCode.get(code);
  if (!gameId) {
    sendError(ws, "Game not found");
    return;
  }
  const game = gamesById.get(gameId);
  if (!game) {
    sendError(ws, "Game not found");
    return;
  }
  if (game.status !== "waiting") {
    sendError(ws, "Game is not waiting for players");
    return;
  }
  if (user.index === game.hostId) {
    sendError(ws, "Host cannot join as player");
    return;
  }
  const foundPlayer = game.players.find(
    (player) => player.index === user.index,
  );

  if (foundPlayer) {
    foundPlayer.ws = ws;
  } else {
    const newPlayer: Player = {
      name: user.name,
      index: user.index,
      score: 0,
      ws,
    };
    game.players.push(newPlayer);
  }

  // Общий хвост: состояние комнаты уже обновлено (новый игрок или тот же с новым ws).
  socketToUserId.set(ws, user.index);

  sendMessage(ws, "game_joined", { gameId: game.id });

  const playersPayload = game.players.map((p) => ({
    name: p.name,
    index: p.index,
    score: p.score,
  }));

  broadcastPlayerJoined(game, "player_joined", {
    playerName: user.name,
    playerCount: game.players.length,
  });
  broadcastUpdatePlayers(game, "update_players", playersPayload);
};
