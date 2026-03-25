import { WebSocket } from 'ws';
import { Game, User } from '../types';

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