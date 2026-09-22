import { Server, Socket } from 'socket.io';
import { setupClockSync } from './clockSync';
import {
  createRoom,
  joinRoom,
  leaveRoom,
  setMemberInstrument,
  updateTransport,
  updateMemberPing,
  getRoom,
  recordEvent,
  toggleRecording,
  getPerformances,
} from './roomManager';
import { generateAIBandmateSequence } from './aiBandmate';
import { NoteEvent, InstrumentType, TransportState, AIBandmateConfig } from '../types';

export function setupSocketEvents(io: Server): void {
  io.on('connection', (socket: Socket) => {
    // 1. Clock synchronization ping/pong
    setupClockSync(socket);

    // 2. Ping measurement for member latency display
    socket.on('ping-measure', ({ pingMs }: { pingMs: number }) => {
      const result = updateMemberPing(socket.id, pingMs);
      if (result.room && result.code) {
        io.to(result.code).emit('room-updated', result.room);
      }
    });

    // 3. Create room
    socket.on('create-room', ({ name, instrument }: { name: string; instrument?: InstrumentType }) => {
      const room = createRoom(socket.id, name, instrument || 'drums');
      socket.join(room.code);
      io.to(room.code).emit('room-updated', room);
      socket.emit('room-created', { room, memberId: socket.id });
    });

    // 4. Join room
    socket.on('join-room', ({ roomCode, name }: { roomCode: string; name: string }) => {
      const room = joinRoom(roomCode, socket.id, name);
      if (!room) {
        socket.emit('error-message', { message: `Room '${roomCode.toUpperCase()}' not found.` });
        return;
      }

      socket.join(room.code);
      io.to(room.code).emit('room-updated', room);
      socket.emit('room-joined', { room, memberId: socket.id });
    });

    // 5. Leave room
    socket.on('leave-room', () => {
      const { room, code } = leaveRoom(socket.id);
      if (code) {
        socket.leave(code);
        if (room) {
          io.to(code).emit('room-updated', room);
        }
      }
    });

    // 6. Select Instrument
    socket.on('select-instrument', ({ roomCode, instrument }: { roomCode: string; instrument: InstrumentType }) => {
      const room = setMemberInstrument(roomCode, socket.id, instrument);
      if (room) {
        io.to(room.code).emit('room-updated', room);
      }
    });

    // 7. Transport Control (Play, Pause, BPM, Key, Count-in)
    socket.on('transport-control', ({ roomCode, updates }: { roomCode: string; updates: Partial<TransportState> }) => {
      const room = updateTransport(roomCode, updates);
      if (room) {
        io.to(room.code).emit('transport-updated', room.transport);
        io.to(room.code).emit('room-updated', room);
      }
    });

    // 8. Note Event (Musical trigger sent by phone)
    socket.on('note-event', (eventData: Partial<NoteEvent>) => {
      if (!eventData.roomId) return;
      const room = getRoom(eventData.roomId);
      if (!room) return;

      const serverTimestamp = Date.now();
      const completeEvent: NoteEvent = {
        id: eventData.id || `note_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        roomId: room.code,
        senderId: socket.id,
        senderName: eventData.senderName || 'Band Member',
        instrument: eventData.instrument || 'drums',
        note: eventData.note || 'C4',
        pitchFrequency: eventData.pitchFrequency,
        velocity: typeof eventData.velocity === 'number' ? eventData.velocity : 0.8,
        duration: eventData.duration,
        timestamp: eventData.timestamp || serverTimestamp,
        beatStep: eventData.beatStep || 0,
        isQuantized: eventData.isQuantized || false,
      };

      // Record event if recording is enabled
      recordEvent(room.code, completeEvent);

      // Broadcast immediately to all connected members in the room (including sender or excluding based on preference)
      io.to(room.code).emit('note-event-received', completeEvent);
    });

    // 9. AI Bandmate Generator Request
    socket.on('ai-bandmate-generate', ({ roomCode, config }: { roomCode: string; config: AIBandmateConfig }) => {
      const room = getRoom(roomCode);
      if (!room) return;

      const generatedEvents = generateAIBandmateSequence(room, config);
      
      // Broadcast generated notes as a synchronized pattern batch
      io.to(room.code).emit('ai-sequence-received', {
        events: generatedEvents,
        config,
      });
    });

    // 10. Toggle Performance Recording
    socket.on('toggle-recording', ({ roomCode }: { roomCode: string }) => {
      const room = toggleRecording(roomCode);
      if (room) {
        io.to(room.code).emit('room-updated', room);
        io.to(room.code).emit('recording-status-changed', {
          isRecording: room.isRecording,
          performances: getPerformances(),
        });
      }
    });

    // 11. Disconnect handler
    socket.on('disconnect', () => {
      const { room, code } = leaveRoom(socket.id);
      if (code && room) {
        io.to(code).emit('room-updated', room);
      }
    });
  });
}
