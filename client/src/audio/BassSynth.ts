import { audioEngine } from './AudioEngine';

const BASS_NOTE_FREQUENCIES: Record<string, number> = {
  'E1': 41.20, 'F1': 43.65, 'F#1': 46.25, 'G1': 49.00, 'G#1': 51.91, 'A1': 55.00, 'A#1': 58.27, 'B1': 61.74,
  'C2': 65.41, 'C#2': 69.30, 'D2': 73.42, 'D#2': 77.78, 'E2': 82.41, 'F2': 87.31, 'F#2': 92.50, 'G2': 98.00,
  'G#2': 103.83, 'A2': 110.00, 'A#2': 116.54, 'B2': 123.47, 'C3': 130.81, 'D3': 146.83, 'E3': 164.81
};

export type BassStyle = 'sub' | 'slap' | 'pluck';

export class BassSynth {
  public static noteToFreq(note: string): number {
    return BASS_NOTE_FREQUENCIES[note] || 65.41;
  }

  public static playBass(
    note: string,
    time?: number,
    duration = 0.5,
    velocity = 0.9,
    style: BassStyle = 'sub'
  ): void {
    const ctx = audioEngine.getContext();
    const startTime = time || ctx.currentTime;
    const dest = audioEngine.getDestination();
    const freq = this.noteToFreq(note);

    const osc = ctx.createOscillator();
    const subOsc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    switch (style) {
      case 'sub':
        osc.type = 'triangle';
        subOsc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        subOsc.frequency.setValueAtTime(freq / 2, startTime); // Octave down sub

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, startTime);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(velocity * 0.95, startTime + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        break;

      case 'slap':
        osc.type = 'sawtooth';
        subOsc.type = 'square';
        osc.frequency.setValueAtTime(freq, startTime);
        subOsc.frequency.setValueAtTime(freq, startTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(3500, startTime);
        filter.frequency.exponentialRampToValueAtTime(300, startTime + 0.12); // Slap pluck snap

        gain.gain.setValueAtTime(velocity, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration * 0.7);
        break;

      case 'pluck':
        osc.type = 'square';
        subOsc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        subOsc.frequency.setValueAtTime(freq, startTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, startTime);
        filter.frequency.exponentialRampToValueAtTime(150, startTime + 0.18);

        gain.gain.setValueAtTime(velocity * 0.85, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        break;
    }

    osc.connect(filter);
    subOsc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc.start(startTime);
    subOsc.start(startTime);
    osc.stop(startTime + duration + 0.1);
    subOsc.stop(startTime + duration + 0.1);
  }
}
