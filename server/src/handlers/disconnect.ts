import { finishQuestion } from "../services/questionFlowForStartGame.js";
import {
  broadcastErrorToGame,
  broadcastUpdatePlayers,
  gameIdByCode,
  gamesById,
  socketToUserId,
  usersById,
} from "../state/store.js";
import type { WebSocket } from "ws";

const allRemainingPlayersAnswered = (game: {
  players: { index: string }[];
  playerAnswers: Map<string, unknown>;
}): boolean => {
  if (game.players.length === 0) {
    return true;
  }
  return game.players.every((player) => game.playerAnswers.has(player.index));
};

export const handleDisconnect = (ws: WebSocket): void => {
  const userId = socketToUserId.get(ws);
  if (!userId) {
    return;
  }

  socketToUserId.delete(ws);

  const user = usersById.get(userId);
  if (user && user.ws === ws) {
    user.ws = undefined;
  }

  const gamesSnapshot = [...gamesById.values()];

  for (const game of gamesSnapshot) {
    if (game.hostId === userId) {
      clearTimeout(game.questionTimer);
      game.questionTimer = undefined;
      game.status = "finished";

      broadcastErrorToGame(game, "Host disconnected. Game ended.");

      gamesById.delete(game.id);
      gameIdByCode.delete(game.code);
      continue;
    }

    const playerIndex = game.players.findIndex(
      (player) => player.index === userId,
    );
    if (playerIndex === -1) {
      continue;
    }

    game.players.splice(playerIndex, 1);
    game.playerAnswers.delete(userId);

    const playersPayload = game.players.map((p) => ({
      name: p.name,
      index: p.index,
      score: p.score,
    }));

    broadcastUpdatePlayers(game, "update_players", playersPayload);

    if (game.status === "in_progress" && allRemainingPlayersAnswered(game)) {
      clearTimeout(game.questionTimer);
      finishQuestion(game);
    }
  }
};
