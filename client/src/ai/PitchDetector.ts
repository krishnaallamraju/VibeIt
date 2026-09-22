// PitchDetector - Autocorrelation Pitch Estimation & Scale Snapping Engine

const MIDI_NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export interface PitchResult {
  frequency: number;
  note: string; // e.g. 'C4'
  cents: number; // Pitch detuning in cents
  confidence: number;
  isNoteActive: boolean;
}

const SCALE_PRESETS: Record<string, string[]> = {
  'C Major': ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
  'A Minor': ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
  'Pentatonic': ['C', 'D', 'E', 'G', 'A'],
  'Chromatic': ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
};

export class PitchDetector {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private buffer: Float32Array | null = null;

  public async startMicrophone(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      this.mediaStream = stream;

      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
      const source = this.audioCtx.createMediaStreamSource(stream);

      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 2048;
      source.connect(this.analyser);

      this.buffer = new Float32Array(this.analyser.fftSize);
      return true;
    } catch (err) {
      console.warn('Microphone permission denied or unsupported:', err);
      return false;
    }
  }

  public stopMicrophone(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    if (this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = null;
    }
  }

  // Autocorrelation Pitch Detection Algorithm
  public detectPitch(scaleName = 'C Major'): PitchResult | null {
    if (!this.analyser || !this.buffer || !this.audioCtx) return null;

    this.analyser.getFloatTimeDomainData(this.buffer as any);

    // Calculate RMS volume signal level
    let rms = 0;
    for (let i = 0; i < this.buffer.length; i++) {
      rms += this.buffer[i] * this.buffer[i];
    }
    rms = Math.sqrt(rms / this.buffer.length);

    // Noise threshold (If too quiet, return inactive)
    if (rms < 0.02) {
      return { frequency: 0, note: '-', cents: 0, confidence: 0, isNoteActive: false };
    }

    // Autocorrelation computation
    const SIZE = this.buffer.length;
    const MAX_SAMPLES = Math.floor(SIZE / 2);
    let bestOffset = -1;
    let bestCorrelation = 0;
    let foundGoodCorrelation = false;
    const correlations = new Float32Array(MAX_SAMPLES);

    for (let offset = 0; offset < MAX_SAMPLES; offset++) {
      let correlation = 0;
      for (let i = 0; i < MAX_SAMPLES; i++) {
        correlation += Math.abs(this.buffer[i] - this.buffer[i + offset]);
      }
      correlation = 1 - (correlation / MAX_SAMPLES);
      correlations[offset] = correlation;

      if (correlation > 0.85 && correlation > bestCorrelation) {
        foundGoodCorrelation = true;
        if (correlation > bestCorrelation) {
          bestCorrelation = correlation;
          bestOffset = offset;
        }
      }
    }

    if (!foundGoodCorrelation || bestOffset === -1) {
      return { frequency: 0, note: '-', cents: 0, confidence: rms, isNoteActive: false };
    }

    const sampleRate = this.audioCtx.sampleRate;
    const fundamentalFreq = sampleRate / bestOffset;

    // Filter reasonable vocal range (80 Hz to 1100 Hz)
    if (fundamentalFreq < 80 || fundamentalFreq > 1100) {
      return { frequency: 0, note: '-', cents: 0, confidence: 0, isNoteActive: false };
    }

    // Frequency to MIDI note calculation
    const midiNum = Math.round(69 + 12 * Math.log2(fundamentalFreq / 440));
    const rawNoteName = MIDI_NOTE_NAMES[midiNum % 12];
    const octave = Math.floor(midiNum / 12) - 1;

    // Scale quantization snapping
    const allowedNotes = SCALE_PRESETS[scaleName] || SCALE_PRESETS['C Major'];
    let snappedNoteName = rawNoteName;
    if (!allowedNotes.includes(rawNoteName)) {
      // Find closest allowed note in scale
      snappedNoteName = allowedNotes[0];
      let minDiff = 12;
      for (const note of allowedNotes) {
        const noteIdx = MIDI_NOTE_NAMES.indexOf(note);
        const rawIdx = MIDI_NOTE_NAMES.indexOf(rawNoteName);
        const diff = Math.abs(noteIdx - rawIdx);
        if (diff < minDiff) {
          minDiff = diff;
          snappedNoteName = note;
        }
      }
    }

    const finalNote = `${snappedNoteName}${octave}`;
    const exactMidi = 69 + 12 * Math.log2(fundamentalFreq / 440);
    const cents = Math.round((exactMidi - midiNum) * 100);

    return {
      frequency: Math.round(fundamentalFreq),
      note: finalNote,
      cents,
      confidence: Math.round(bestCorrelation * 100),
      isNoteActive: true,
    };
  }
}
