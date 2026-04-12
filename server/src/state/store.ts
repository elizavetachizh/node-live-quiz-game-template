import { WebSocket } from 'ws';
import { Game, GameFinishedPayload, PlayerJoinedPayload, QuestionPayload, QuestionResultPayload, UpdatePlayersPayload, User } from '../types.js';
import { sendMessage } from '../ws/protocol.js';

  // делаем разные сеттеры для разных типов данных
//  - usersByName: быстрый доступ для проверки login/register
// - usersById: пригодится для будущих шагов (игры, hostId и т.д.)
// - socketToUserId: связь активного сокета с пользователем
export const usersByName = new Map<string, User>();
export const usersById = new Map<string, User>();
export const socketToUserId = new Map<WebSocket, string>();


//for games
export const gamesById = new Map<string, Game>();
export const gameIdByCode = new Map<string, string>();


export const getUserBySocket = (ws: WebSocket): User | undefined => {
  const userId = socketToUserId.get(ws);
  if(!userId){
    return undefined;
  }
  return usersById.get(userId);
};

export const broadcastPlayerJoined = (game: Game, type: string, data: PlayerJoinedPayload) => {
  
  const sockets = new Set<WebSocket>();
  const hostUser = usersById.get(game.hostId);
  if (hostUser?.ws && hostUser.ws.readyState === WebSocket.OPEN) {
    sockets.add(hostUser.ws);
  }
  for (const player of game.players) {
    if (player.ws && player.ws.readyState === WebSocket.OPEN) {
      sockets.add(player.ws);
    }
  }
  for (const ws of sockets) {
    sendMessage(ws, type, data);
  }
}


export const broadcastUpdatePlayers = (game: Game, type: string, data: UpdatePlayersPayload[]) => {
  
  const sockets = new Set<WebSocket>();
  const hostUser = usersById.get(game.hostId);
  if (hostUser?.ws && hostUser.ws.readyState === WebSocket.OPEN) {
    sockets.add(hostUser.ws);
  }
  for (const player of game.players) {
    if (player.ws && player.ws.readyState === WebSocket.OPEN) {
      sockets.add(player.ws);
    }
  }
  for (const ws of sockets) {
    sendMessage(ws, type, data);
  
  }
}

export const broadcastToGame=(game: Game, type: string, data: QuestionPayload) => {
  const sockets = new Set<WebSocket>();
  const hostUser = usersById.get(game.hostId);
  if (hostUser?.ws && hostUser.ws.readyState === WebSocket.OPEN) {
    sockets.add(hostUser.ws);
  }
  for (const player of game.players) {
    if (player.ws && player.ws.readyState === WebSocket.OPEN) {
      sockets.add(player.ws);
    }
  }
  for (const ws of sockets) {
    sendMessage(ws, type, data);
  }
}
export const broadcastQuestionResult = (game: Game, type: string, data: QuestionResultPayload) => {
  const sockets = new Set<WebSocket>();
  const hostUser = usersById.get(game.hostId);
  if (hostUser?.ws && hostUser.ws.readyState === WebSocket.OPEN) {
    sockets.add(hostUser.ws);
  }
  for (const player of game.players) {
    if (player.ws && player.ws.readyState === WebSocket.OPEN) {
      sockets.add(player.ws);
    }
  }
  for (const ws of sockets) {
    sendMessage(ws, type, data);
  }
}

export const broadcastGameFinished = (game: Game, type: string, data: GameFinishedPayload) => {
  const sockets = new Set<WebSocket>();
  const hostUser = usersById.get(game.hostId);
  if (hostUser?.ws && hostUser.ws.readyState === WebSocket.OPEN) {
    sockets.add(hostUser.ws);
  }
  for (const player of game.players) {
    if (player.ws && player.ws.readyState === WebSocket.OPEN) {
      sockets.add(player.ws);
    }
  }
  for (const ws of sockets) {
    sendMessage(ws, type, data);
  }
}

const collectGameSockets = (game: Game): Set<WebSocket> => {
  const sockets = new Set<WebSocket>();
  const hostUser = usersById.get(game.hostId);
  if (hostUser?.ws && hostUser.ws.readyState === WebSocket.OPEN) {
    sockets.add(hostUser.ws);
  }
  for (const player of game.players) {
    if (player.ws && player.ws.readyState === WebSocket.OPEN) {
      sockets.add(player.ws);
    }
  }
  return sockets;
};

export const broadcastErrorToGame = (game: Game, message: string): void => {
  for (const socket of collectGameSockets(game)) {
    sendMessage(socket, 'error', { message });
  }
};