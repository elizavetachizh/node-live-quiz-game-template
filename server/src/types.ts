import type { WebSocket } from "ws";

export interface Player {
  name: string;
  index: string;
  score: number;
  ws?: WebSocket;
  hasAnswered?: boolean;
  answerTime?: number;
  answeredCorrectly?: boolean;
}

export interface Question {
  text: string;
  options: string[];
  correctIndex: number;
  timeLimitSec: number;
}

export interface Game {
  id: string;
  code: string;
  hostId: string;
  questions: Question[];
  players: Player[];
  currentQuestion: number;
  status: "waiting" | "in_progress" | "finished";
  questionStartTime?: number;
  questionTimer?: NodeJS.Timeout;
  playerAnswers: Map<string, { answerIndex: number; timestamp: number }>;
}

export interface User {
  name: string;
  password: string;
  index: string;
  ws?: WebSocket;
}

export interface WSMessage {
  type: string;
  data: any;
  id: number;
}

export interface RegData {
  name: string;
  password: string;
}

export interface CreateGameData {
  questions: Question[];
}

export interface JoinGameData {
  code: string;
}

export interface StartGameData {
  gameId: string;
}

export interface AnswerData {
  gameId: string;
  questionIndex: number;
  answerIndex: number;
}
export interface PlayerJoinedPayload {
  playerName: string;
  playerCount: number;
}
export interface UpdatePlayersPayload {
  name: string;
  index: string;
  score: number;
}
export interface QuestionPayload {
  questionNumber: number;
  totalQuestions: number;
  text: string;
  options: string[];
  timeLimitSec: number;
}

export interface PlayerResultPayload {
  name: string;
  answered: boolean;
  correct: boolean;
  pointsEarned: number;
  totalScore: number;
}

/** Совпадает с client/src/types QuestionResultMessage + PlayerResult */
export interface QuestionResultPayload {
  questionIndex: number;
  correctIndex: number;
  playerResults: PlayerResultPayload[];
}

export interface GameFinishedPayload {
  scoreboard: { name: string; score: number; rank: number }[];
}
