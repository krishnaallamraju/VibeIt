export type InstrumentType = 'drums' | 'keyboard' | 'bass' | 'vocals' | 'bandmate';

export interface Member {
  id: string;
  name: string;
  instrument: InstrumentType;
  isHost: boolean;
  ping: number;
  color: string;
  joinedAt: number;
}

export interface TransportState {
  isPlaying: boolean;
  bpm: number;
  currentBeat: number;
  masterStartTime: number;
  countIn: number;
  key: string; // e.g., 'C Major', 'A Minor', 'Pentatonic'
}

export interface NoteEvent {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  instrument: InstrumentType;
  note: string; // e.g. 'kick', 'snare', 'C4', 'E4', 'A1'
  pitchFrequency?: number;
  velocity: number; // 0.0 - 1.0
  duration?: number; // duration in ms
  timestamp: number; // Master server time in ms
  beatStep: number;
  isQuantized: boolean;
}

export interface Room {
  code: string;
  hostId: string;
  members: Member[];
  transport: TransportState;
  history: NoteEvent[];
  isRecording: boolean;
  recordingStartTime?: number;
}

export interface PerformanceSession {
  id: string;
  title: string;
  roomId: string;
  date: string;
  duration: number;
  bpm: number;
  key: string;
  membersCount: number;
  eventsCount: number;
  events: NoteEvent[];
}

export interface ClockPingData {
  clientTime: number;
}

export interface ClockPongData {
  clientTime: number;
  serverTime: number;
}

export interface AIBandmateConfig {
  style: 'funk' | 'rock' | 'lofi' | 'edm' | 'jazz';
  complexity: number; // 1 to 5
  autoAccompaniment: boolean;
  targetInstrument: 'drums' | 'bass' | 'keyboard';
}
