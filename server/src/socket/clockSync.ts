import { Socket } from 'socket.io';
import { ClockPingData, ClockPongData } from '../types';

export function setupClockSync(socket: Socket): void {
  socket.on('sync-clock-ping', (data: ClockPingData) => {
    const serverTime = Date.now();
    const pongData: ClockPongData = {
      clientTime: data.clientTime,
      serverTime,
    };
    socket.emit('sync-clock-pong', pongData);
  });
}
