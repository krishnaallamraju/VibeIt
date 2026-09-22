import { audioEngine } from './AudioEngine';

const NOTE_FREQUENCIES: Record<string, number> = {
  'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81,
  'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00,
  'A#3': 233.08, 'B3': 246.94,
  'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63,
  'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00,
  'A#4': 466.16, 'B4': 493.88,
  'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25,
  'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00
};

export type SynthPreset = 'lead' | 'pad' | 'epiano' | 'brass';

export class KeySynth {
  public static noteToFreq(note: string): number {
    return NOTE_FREQUENCIES[note] || 440;
  }

  public static playNote(
    note: string,
    time?: number,
    duration = 0.4,
    velocity = 0.8,
    preset: SynthPreset = 'lead'
  ): void {
    const ctx = audioEngine.getContext();
    const startTime = Math.max(ctx.currentTime, time || ctx.currentTime);
    const dest = audioEngine.getDestination();
    const freq = this.noteToFreq(note);

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    switch (preset) {
      case 'lead':
        osc1.type = 'sawtooth';
        osc2.type = 'square';
        osc1.frequency.setValueAtTime(freq, startTime);
        osc2.frequency.setValueAtTime(freq * 1.002, startTime); // Slight detune for richness

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2400, startTime);
        filter.frequency.exponentialRampToValueAtTime(800, startTime + duration);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(velocity * 0.7, startTime + 0.02); // Attack
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        break;

      case 'pad':
        osc1.type = 'triangle';
        osc2.type = 'sawtooth';
        osc1.frequency.setValueAtTime(freq, startTime);
        osc2.frequency.setValueAtTime(freq * 0.998, startTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, startTime);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(velocity * 0.6, startTime + 0.15); // Warm attack
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration + 0.2);
        break;

      case 'epiano':
        osc1.type = 'sine';
        osc2.type = 'triangle';
        osc1.frequency.setValueAtTime(freq, startTime);
        osc2.frequency.setValueAtTime(freq * 2, startTime); // Harmonic overtone

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(3000, startTime);

        gain.gain.setValueAtTime(velocity * 0.8, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        break;

      case 'brass':
        osc1.type = 'sawtooth';
        osc2.type = 'sawtooth';
        osc1.frequency.setValueAtTime(freq, startTime);
        osc2.frequency.setValueAtTime(freq * 1.005, startTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, startTime);
        filter.frequency.exponentialRampToValueAtTime(3200, startTime + 0.08); // Brass swell

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(velocity * 0.75, startTime + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        break;
    }

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + duration + 0.2);
    osc2.stop(startTime + duration + 0.2);
  }
}
