import { Game } from "../types.js";
import {
  broadcastGameFinished,
  broadcastQuestionResult,
  broadcastToGame,
} from "../state/store.js";

const BASE_POINTS = 1000;
/** Пауза перед следующим вопросом (как «Next question starting soon…» на клиенте) */
const NEXT_QUESTION_DELAY_MS = 2000;

export const finishQuestion = (game: Game): void => {
  if (game.status === "finished") {
    return;
  }

  clearTimeout(game.questionTimer);
  game.questionTimer = undefined;

  const idx = game.currentQuestion;
  const q = game.questions[idx];
  if (!q) {
    return;
  }

  const playerResults = game.players.map((player) => {
    const entry = game.playerAnswers.get(player.index);
    const answered = entry !== undefined && entry.answerIndex !== -1;
    const correct = answered && entry!.answerIndex === q.correctIndex;

    let pointsEarned = 0;
    if (correct && entry && game.questionStartTime !== undefined) {
      const elapsedSec = Math.max(
        0,
        (entry.timestamp - game.questionStartTime) / 1000,
      );
      const timeRemaining = Math.max(0, q.timeLimitSec - elapsedSec);
      pointsEarned = Math.floor(BASE_POINTS * (timeRemaining / q.timeLimitSec));
    }

    player.score += pointsEarned;

    return {
      name: player.name,
      answered,
      correct,
      pointsEarned,
      totalScore: player.score,
    };
  });

  broadcastQuestionResult(game, "question_result", {
    questionIndex: idx,
    correctIndex: q.correctIndex,
    playerResults,
  });

  if (idx + 1 >= game.questions.length) {
    const sorted = [...game.players].sort((a, b) => b.score - a.score);
    const scoreboard = sorted.map((player, i) => ({
      name: player.name,
      score: player.score,
      rank: i + 1,
    }));

    broadcastGameFinished(game, "game_finished", { scoreboard });
    game.status = "finished";
    game.questionStartTime = undefined;
    return;
  }

  setTimeout(() => {
    startQuestion(game, idx + 1);
  }, NEXT_QUESTION_DELAY_MS);
};

export const startQuestion = (game: Game, questionIndex: number): void => {
  if (questionIndex < 0 || questionIndex >= game.questions.length) {
    return;
  }

  clearTimeout(game.questionTimer);

  game.currentQuestion = questionIndex;
  game.questionStartTime = Date.now();
  game.playerAnswers.clear();

  const q = game.questions[questionIndex];

  const payload = {
    questionNumber: questionIndex + 1,
    totalQuestions: game.questions.length,
    text: q.text,
    options: q.options,
    timeLimitSec: q.timeLimitSec,
  };
  broadcastToGame(game, "question", payload);

  game.questionTimer = setTimeout(
    () => finishQuestion(game),
    q.timeLimitSec * 1000,
  );
};
