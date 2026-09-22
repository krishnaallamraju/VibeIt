import { io, Socket } from 'socket.io-client';
import { ntpClock } from './NTPClock';
import { Room, NoteEvent, TransportState, InstrumentType, AIBandmateConfig } from '../types';

type RoomCallback = (room: Room) => void;
type NoteCallback = (event: NoteEvent) => void;
type TransportCallback = (transport: TransportState) => void;
type AISequenceCallback = (data: { events: NoteEvent[]; config: AIBandmateConfig }) => void;
type ErrorCallback = (err: string) => void;

const STORAGE_KEY = 'vibeit_server_url';
const DEFAULT_TUNNEL_URL = 'https://vibeit-master-server.loca.lt';
const DEFAULT_WIFI_IP = 'http://10.188.203.113:4000';

class SocketClientManager {
  private socket: Socket | null = null;
  private pingInterval: any = null;
  private customServerUrl: string | null = null;
  private roomListeners: RoomCallback[] = [];
  private noteListeners: NoteCallback[] = [];
  private transportListeners: TransportCallback[] = [];
  private aiSequenceListeners: AISequenceCallback[] = [];
  private errorListeners: ErrorCallback[] = [];

  constructor() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && saved.trim()) {
        this.customServerUrl = saved.trim();
      }
    }
  }

  public setServerUrl(url: string): void {
    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      if (cleanUrl.includes('.loca.lt') || cleanUrl.includes('.ngrok') || cleanUrl.includes('.cloudflared')) {
        cleanUrl = `https://${cleanUrl}`;
      } else {
        cleanUrl = `http://${cleanUrl}`;
      }
    }
    cleanUrl = cleanUrl.replace(/\/+$/, '');

    // Only append :4000 if it is a local IP or localhost without an explicit port
    const hasPort = /:\d+$/.test(cleanUrl);
    if (!hasPort) {
      if (/^https?:\/\/(localhost|127\.0\.0\.1|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/.test(cleanUrl)) {
        cleanUrl = `${cleanUrl}:4000`;
      }
    }

    this.customServerUrl = cleanUrl;
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEY, cleanUrl);
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.connect();
  }

  public getServerUrl(): string {
    if (this.customServerUrl) {
      return this.customServerUrl;
    }

    // Check if running on Android/iOS Capacitor native wrapper
    const isCapacitor = typeof window !== 'undefined' && Boolean((window as any).Capacitor);

    if (typeof window !== 'undefined' && window.location && window.location.hostname) {
      const hostname = window.location.hostname;
      if (hostname !== 'localhost' && hostname !== '127.0.0.1' && hostname !== '') {
        const protocol = window.location.protocol || 'http:';
        const port = window.location.port ? `:${window.location.port}` : (hostname.includes('loca.lt') ? '' : ':4000');
        return `${protocol}//${hostname}${port}`;
      }
    }

    return isCapacitor ? DEFAULT_WIFI_IP : DEFAULT_TUNNEL_URL;
  }

  public connect(): Socket {
    if (this.socket && this.socket.connected) return this.socket;

    const serverUrl = this.getServerUrl();
    console.log('🔌 Connecting SocketClient to server:', serverUrl);

    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      extraHeaders: {
        'bypass-tunnel-reminder': 'true',
      },
      reconnectionAttempts: 30,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to VibeIt Socket Server:', this.socket?.id);
      this.errorListeners.forEach(cb => cb('')); // Clear error
      this.startClockSync();
    });

    this.socket.on('connect_error', (err) => {
      console.warn('⚠️ Socket connection error:', err.message);
      this.errorListeners.forEach(cb => cb(`Cannot connect to server at ${serverUrl}. Please check connection settings.`));
    });

    this.socket.on('sync-clock-pong', (data: { clientTime: number; serverTime: number }) => {
      ntpClock.updateClockOffset(data.clientTime, data.serverTime);
      const pingMs = ntpClock.getAverageRTT();
      this.socket?.emit('ping-measure', { pingMs });
    });

    this.socket.on('room-updated', (room: Room) => {
      this.roomListeners.forEach(cb => cb(room));
    });

    this.socket.on('room-created', ({ room }: { room: Room }) => {
      this.roomListeners.forEach(cb => cb(room));
    });

    this.socket.on('room-joined', ({ room }: { room: Room }) => {
      this.roomListeners.forEach(cb => cb(room));
    });

    this.socket.on('transport-updated', (transport: TransportState) => {
      this.transportListeners.forEach(cb => cb(transport));
    });

    this.socket.on('note-event-received', (event: NoteEvent) => {
      this.noteListeners.forEach(cb => cb(event));
    });

    this.socket.on('ai-sequence-received', (data: { events: NoteEvent[]; config: AIBandmateConfig }) => {
      this.aiSequenceListeners.forEach(cb => cb(data));
    });

    this.socket.on('error-message', ({ message }: { message: string }) => {
      this.errorListeners.forEach(cb => cb(message));
    });

    this.socket.on('disconnect', () => {
      console.warn('⚠️ Disconnected from VibeIt server.');
    });

    return this.socket;
  }

  private startClockSync(): void {
    if (this.pingInterval) clearInterval(this.pingInterval);
    this.pingInterval = setInterval(() => {
      if (this.socket && this.socket.connected) {
        this.socket.emit('sync-clock-ping', { clientTime: Date.now() });
      }
    }, 2000);
  }

  public createRoom(name: string, instrument: InstrumentType = 'drums'): void {
    this.connect().emit('create-room', { name, instrument });
  }

  public joinRoom(roomCode: string, name: string): void {
    this.connect().emit('join-room', { roomCode, name });
  }

  public leaveRoom(): void {
    if (this.socket) {
      this.socket.emit('leave-room');
    }
  }

  public selectInstrument(roomCode: string, instrument: InstrumentType): void {
    if (this.socket) {
      this.socket.emit('select-instrument', { roomCode, instrument });
    }
  }

  public sendTransportControl(roomCode: string, updates: Partial<TransportState>): void {
    if (this.socket) {
      this.socket.emit('transport-control', { roomCode, updates });
    }
  }

  public sendNoteEvent(event: Partial<NoteEvent>): void {
    if (this.socket) {
      this.socket.emit('note-event', event);
    }
  }

  public requestAIBandmate(roomCode: string, config: AIBandmateConfig): void {
    if (this.socket) {
      this.socket.emit('ai-bandmate-generate', { roomCode, config });
    }
  }

  public toggleRecording(roomCode: string): void {
    if (this.socket) {
      this.socket.emit('toggle-recording', { roomCode });
    }
  }

  public onRoomUpdate(cb: RoomCallback): () => void {
    this.roomListeners.push(cb);
    return () => {
      this.roomListeners = this.roomListeners.filter(l => l !== cb);
    };
  }

  public onNoteEvent(cb: NoteCallback): () => void {
    this.noteListeners.push(cb);
    return () => {
      this.noteListeners = this.noteListeners.filter(l => l !== cb);
    };
  }

  public onTransportUpdate(cb: TransportCallback): () => void {
    this.transportListeners.push(cb);
    return () => {
      this.transportListeners = this.transportListeners.filter(l => l !== cb);
    };
  }

  public onAISequence(cb: AISequenceCallback): () => void {
    this.aiSequenceListeners.push(cb);
    return () => {
      this.aiSequenceListeners = this.aiSequenceListeners.filter(l => l !== cb);
    };
  }

  public onError(cb: ErrorCallback): () => void {
    this.errorListeners.push(cb);
    return () => {
      this.errorListeners = this.errorListeners.filter(l => l !== cb);
    };
  }

  public getSocketId(): string {
    return this.socket?.id || '';
  }
}

export const socketClient = new SocketClientManager();
