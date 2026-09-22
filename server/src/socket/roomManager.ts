import { Room, Member, InstrumentType, TransportState, NoteEvent, PerformanceSession } from '../types';

const rooms = new Map<string, Room>();
const performances: PerformanceSession[] = [];

const MEMBER_COLORS = [
  '#FF5733', '#33FF57', '#3357FF', '#F333FF',
  '#33FFF5', '#FFC300', '#FF33A8', '#00E676'
];

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function createRoom(hostId: string, hostName: string, instrument: InstrumentType = 'drums'): Room {
  let code = generateRoomCode();
  while (rooms.has(code)) {
    code = generateRoomCode();
  }

  const hostMember: Member = {
    id: hostId,
    name: hostName || 'Band Leader',
    instrument,
    isHost: true,
    ping: 0,
    color: MEMBER_COLORS[0],
    joinedAt: Date.now(),
  };

  const initialTransport: TransportState = {
    isPlaying: false,
    bpm: 120,
    currentBeat: 0,
    masterStartTime: 0,
    countIn: 4,
    key: 'C Major',
  };

  const room: Room = {
    code,
    hostId,
    members: [hostMember],
    transport: initialTransport,
    history: [],
    isRecording: false,
  };

  rooms.set(code, room);
  return room;
}

export function joinRoom(roomCode: string, memberId: string, memberName: string): Room | null {
  const code = roomCode.toUpperCase();
  const room = rooms.get(code);
  if (!room) return null;

  // Check if member already in room
  const existingIndex = room.members.findIndex(m => m.id === memberId);
  if (existingIndex !== -1) {
    room.members[existingIndex].name = memberName || room.members[existingIndex].name;
    return room;
  }

  // Pick available instrument
  const usedInstruments = new Set(room.members.map(m => m.instrument));
  const availableInstruments: InstrumentType[] = ['drums', 'keyboard', 'bass', 'vocals', 'bandmate'];
  const nextInstrument = availableInstruments.find(i => !usedInstruments.has(i)) || 'keyboard';

  const newMember: Member = {
    id: memberId,
    name: memberName || `Player ${room.members.length + 1}`,
    instrument: nextInstrument,
    isHost: false,
    ping: 0,
    color: MEMBER_COLORS[room.members.length % MEMBER_COLORS.length],
    joinedAt: Date.now(),
  };

  room.members.push(newMember);
  return room;
}

export function leaveRoom(memberId: string): { room: Room | null; code: string | null } {
  for (const [code, room] of rooms.entries()) {
    const memberIndex = room.members.findIndex(m => m.id === memberId);
    if (memberIndex !== -1) {
      room.members.splice(memberIndex, 1);
      
      // If room empty, remove it
      if (room.members.length === 0) {
        rooms.delete(code);
        return { room: null, code };
      }

      // If host left, assign new host
      if (room.hostId === memberId && room.members.length > 0) {
        room.members[0].isHost = true;
        room.hostId = room.members[0].id;
      }

      return { room, code };
    }
  }
  return { room: null, code: null };
}

export function setMemberInstrument(roomCode: string, memberId: string, instrument: InstrumentType): Room | null {
  const room = rooms.get(roomCode.toUpperCase());
  if (!room) return null;

  const member = room.members.find(m => m.id === memberId);
  if (member) {
    member.instrument = instrument;
  }
  return room;
}

export function updateTransport(roomCode: string, updates: Partial<TransportState>): Room | null {
  const room = rooms.get(roomCode.toUpperCase());
  if (!room) return null;

  room.transport = {
    ...room.transport,
    ...updates,
  };

  if (updates.isPlaying === true && updates.masterStartTime === undefined) {
    room.transport.masterStartTime = Date.now() + 500; // 500ms lead time for sync buffer
  }

  return room;
}

export function updateMemberPing(memberId: string, pingMs: number): { room: Room | null; code: string | null } {
  for (const [code, room] of rooms.entries()) {
    const member = room.members.find(m => m.id === memberId);
    if (member) {
      member.ping = Math.round(pingMs);
      return { room, code };
    }
  }
  return { room: null, code: null };
}

export function getRoom(roomCode: string): Room | null {
  return rooms.get(roomCode.toUpperCase()) || null;
}

export function getAllRooms(): Room[] {
  return Array.from(rooms.values());
}

export function recordEvent(roomCode: string, event: NoteEvent): void {
  const room = rooms.get(roomCode.toUpperCase());
  if (room && room.isRecording) {
    room.history.push(event);
  }
}

export function toggleRecording(roomCode: string): Room | null {
  const room = rooms.get(roomCode.toUpperCase());
  if (!room) return null;

  if (!room.isRecording) {
    room.isRecording = true;
    room.recordingStartTime = Date.now();
    room.history = [];
  } else {
    room.isRecording = false;
    if (room.history.length > 0) {
      const session: PerformanceSession = {
        id: `perf_${Date.now()}`,
        title: `Live Jam in ${room.code}`,
        roomId: room.code,
        date: new Date().toISOString(),
        duration: Math.round((Date.now() - (room.recordingStartTime || Date.now())) / 1000),
        bpm: room.transport.bpm,
        key: room.transport.key,
        membersCount: room.members.length,
        eventsCount: room.history.length,
        events: [...room.history],
      };
      performances.unshift(session);
    }
  }
  return room;
}

export function getPerformances(): PerformanceSession[] {
  return performances;
}
