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
  key: string;
}

export interface NoteEvent {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  instrument: InstrumentType;
  note: string;
  pitchFrequency?: number;
  velocity: number;
  duration?: number;
  timestamp: number;
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

export interface AIBandmateConfig {
  style: 'funk' | 'rock' | 'lofi' | 'edm' | 'jazz';
  complexity: number;
  autoAccompaniment: boolean;
  targetInstrument: 'drums' | 'bass' | 'keyboard';
}
