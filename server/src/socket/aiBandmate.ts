import { Room, NoteEvent, AIBandmateConfig } from '../types';

// Scale frequencies/notes mapping for AI generation
const SCALES: Record<string, string[]> = {
  'C Major': ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4', 'E4', 'G4'],
  'A Minor': ['A2', 'C3', 'D3', 'E3', 'G3', 'A3', 'C4', 'D4', 'E4', 'G4'],
  'Pentatonic': ['C3', 'D3', 'E3', 'G3', 'A3', 'C4', 'D4', 'E4', 'G4', 'A4'],
  'Funk Blues': ['C3', 'Eb3', 'F3', 'F#3', 'G3', 'Bb3', 'C4', 'Eb4', 'F4'],
};

// Preset drum pattern sequences (16 beat steps)
const DRUM_GROOVES: Record<string, { note: string; beat: number; velocity: number }[]> = {
  funk: [
    { note: 'kick', beat: 0, velocity: 0.9 },
    { note: 'snare', beat: 4, velocity: 0.8 },
    { note: 'hihat', beat: 2, velocity: 0.6 },
    { note: 'hihat', beat: 6, velocity: 0.6 },
    { note: 'kick', beat: 7, velocity: 0.7 },
    { note: 'kick', beat: 10, velocity: 0.85 },
    { note: 'snare', beat: 12, velocity: 0.9 },
    { note: 'hihat', beat: 14, velocity: 0.7 },
  ],
  rock: [
    { note: 'kick', beat: 0, velocity: 0.95 },
    { note: 'hihat', beat: 0, velocity: 0.5 },
    { note: 'hihat', beat: 2, velocity: 0.5 },
    { note: 'snare', beat: 4, velocity: 0.9 },
    { note: 'hihat', beat: 4, velocity: 0.5 },
    { note: 'hihat', beat: 6, velocity: 0.5 },
    { note: 'kick', beat: 8, velocity: 0.9 },
    { note: 'kick', beat: 10, velocity: 0.8 },
    { note: 'snare', beat: 12, velocity: 0.95 },
    { note: 'hihat', beat: 14, velocity: 0.6 },
  ],
  lofi: [
    { note: 'kick', beat: 0, velocity: 0.8 },
    { note: 'hihat', beat: 2, velocity: 0.4 },
    { note: 'snare', beat: 4, velocity: 0.7 },
    { note: 'hihat', beat: 6, velocity: 0.4 },
    { note: 'kick', beat: 9, velocity: 0.75 },
    { note: 'snare', beat: 12, velocity: 0.7 },
    { note: 'hihat', beat: 14, velocity: 0.4 },
  ],
  edm: [
    { note: 'kick', beat: 0, velocity: 1.0 },
    { note: 'hihat', beat: 2, velocity: 0.7 },
    { note: 'kick', beat: 4, velocity: 1.0 },
    { note: 'snare', beat: 4, velocity: 0.85 },
    { note: 'hihat', beat: 6, velocity: 0.7 },
    { note: 'kick', beat: 8, velocity: 1.0 },
    { note: 'hihat', beat: 10, velocity: 0.7 },
    { note: 'kick', beat: 12, velocity: 1.0 },
    { note: 'snare', beat: 12, velocity: 0.85 },
    { note: 'hihat', beat: 14, velocity: 0.7 },
  ],
  jazz: [
    { note: 'kick', beat: 0, velocity: 0.7 },
    { note: 'hihat', beat: 3, velocity: 0.5 },
    { note: 'snare', beat: 4, velocity: 0.6 },
    { note: 'hihat', beat: 7, velocity: 0.5 },
    { note: 'kick', beat: 8, velocity: 0.65 },
    { note: 'snare', beat: 10, velocity: 0.5 },
    { note: 'snare', beat: 12, velocity: 0.7 },
  ]
};

// Generates 4-bar AI accompaniment sequence
export function generateAIBandmateSequence(room: Room, config: AIBandmateConfig): NoteEvent[] {
  const events: NoteEvent[] = [];
  const key = room.transport.key || 'C Major';
  const scale = SCALES[key] || SCALES['C Major'];
  const bpm = room.transport.bpm || 120;
  const beatIntervalMs = (60 / bpm) * 1000 / 4; // 1/16 note duration in ms
  const baseTime = Date.now() + 200; // Start slightly in future for sync

  const activeInstruments = new Set(room.members.map(m => m.instrument));

  // Determine what role AI should take if auto-assigned
  let role = config.targetInstrument;
  if (!role || role === ('bandmate' as any)) {
    if (!activeInstruments.has('drums')) role = 'drums';
    else if (!activeInstruments.has('bass')) role = 'bass';
    else role = 'keyboard';
  }

  if (role === 'drums') {
    const groove = DRUM_GROOVES[config.style] || DRUM_GROOVES.funk;
    for (let bar = 0; bar < 2; bar++) {
      for (const item of groove) {
        const beatStep = bar * 16 + item.beat;
        events.push({
          id: `ai_drum_${Date.now()}_${beatStep}`,
          roomId: room.code,
          senderId: 'ai_bandmate_bot',
          senderName: 'AI Bandmate (Drums)',
          instrument: 'drums',
          note: item.note,
          velocity: item.velocity * (0.8 + (config.complexity * 0.05)),
          timestamp: baseTime + (beatStep * beatIntervalMs),
          beatStep,
          isQuantized: true,
        });
      }
    }
  } else if (role === 'bass') {
    // Generate walking or groovy bassline based on scale
    const bassNotes = [scale[0], scale[2], scale[4], scale[0], scale[1], scale[3], scale[4], scale[2]];
    for (let step = 0; step < 16; step += 2) {
      const note = bassNotes[(step / 2) % bassNotes.length];
      events.push({
        id: `ai_bass_${Date.now()}_${step}`,
        roomId: room.code,
        senderId: 'ai_bandmate_bot',
        senderName: 'AI Bandmate (Bass)',
        instrument: 'bass',
        note,
        velocity: 0.85,
        duration: beatIntervalMs * 1.5,
        timestamp: baseTime + (step * beatIntervalMs),
        beatStep: step,
        isQuantized: true,
      });
    }
  } else {
    // Generate chord pad / polyphonic synth harmony
    const chordSteps = [0, 4, 8, 12];
    for (const step of chordSteps) {
      const rootIdx = (step / 4) % (scale.length - 2);
      const notes = [scale[rootIdx], scale[rootIdx + 2], scale[rootIdx + 4]];
      for (const note of notes) {
        events.push({
          id: `ai_key_${Date.now()}_${step}_${note}`,
          roomId: room.code,
          senderId: 'ai_bandmate_bot',
          senderName: 'AI Bandmate (Keys)',
          instrument: 'keyboard',
          note,
          velocity: 0.7,
          duration: beatIntervalMs * 3.5,
          timestamp: baseTime + (step * beatIntervalMs),
          beatStep: step,
          isQuantized: true,
        });
      }
    }
  }

  return events;
}
