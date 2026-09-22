import { audioEngine } from './AudioEngine';
import { DrumSynth } from './DrumSynth';
import { KeySynth, SynthPreset } from './KeySynth';
import { BassSynth, BassStyle } from './BassSynth';
import { NoteEvent } from '../types';

export class BeatQuantizer {
  // Calculates delay in milliseconds until next beat division
  public static getNextBeatTime(
    bpm: number,
    clockOffsetMs: number,
    quantization: '1/4' | '1/8' | '1/16' | 'none' = '1/16'
  ): { targetTimeMs: number; delayMs: number; beatStep: number } {
    if (quantization === 'none') {
      const now = Date.now() + clockOffsetMs;
      return { targetTimeMs: now, delayMs: 0, beatStep: 0 };
    }

    const quarterMs = (60 / bpm) * 1000;
    const divisionMs = quantization === '1/4' ? quarterMs : quantization === '1/8' ? quarterMs / 2 : quarterMs / 4;

    const now = Date.now() + clockOffsetMs;
    const currentStep = Math.floor(now / divisionMs);
    const nextStep = currentStep + 1;
    const targetTimeMs = nextStep * divisionMs;
    const delayMs = Math.max(0, targetTimeMs - now);

    return { targetTimeMs, delayMs, beatStep: nextStep % 16 };
  }

  // Play incoming note event aligned with Web Audio API master clock
  public static playNoteEvent(event: NoteEvent, clockOffsetMs: number): void {
    const ctx = audioEngine.getContext();
    const serverTimeNow = Date.now() + clockOffsetMs;
    const eventTimeMs = event.timestamp;
    
    // Calculate difference between event target time and current server time
    const diffMs = eventTimeMs - serverTimeNow;
    
    // Convert to AudioContext.currentTime in seconds
    const audioTime = ctx.currentTime + Math.max(0, diffMs / 1000);

    const instrument = event.instrument;
    const note = event.note;
    const velocity = event.velocity || 0.8;

    switch (instrument) {
      case 'drums':
        DrumSynth.triggerPad(note, audioTime, velocity);
        break;
      case 'keyboard':
        KeySynth.playNote(note, audioTime, (event.duration || 400) / 1000, velocity, 'lead');
        break;
      case 'bass':
        BassSynth.playBass(note, audioTime, (event.duration || 500) / 1000, velocity, 'sub');
        break;
      case 'vocals':
        // Vocal synth trigger uses polyphonic key synth with warm pad / lead sound
        KeySynth.playNote(note, audioTime, (event.duration || 350) / 1000, velocity, 'pad');
        break;
      case 'bandmate':
        KeySynth.playNote(note, audioTime, (event.duration || 400) / 1000, velocity, 'brass');
        break;
      default:
        DrumSynth.triggerPad('kick', audioTime, velocity);
        break;
    }
  }
}
