import { WebSocket } from 'ws';
// Единая обертка отправки: все ответы в формате { type, data, id: 0 }
export const sendMessage = (ws: WebSocket, type: string, data: unknown): void => {
    if (ws.readyState !== WebSocket.OPEN) {
      return;
    }
    ws.send(JSON.stringify({ type, data, id: 0 }));
  };
  
  // Единая отправка ошибок в согласованном формате
  export const sendError = (ws: WebSocket, message: string): void => {
    sendMessage(ws, 'error', { message });
  };
