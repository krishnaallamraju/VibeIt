import { audioEngine } from './AudioEngine';

export class DrumSynth {
  // Play kick drum: exponential frequency sweep from 150Hz down to 30Hz
  public static playKick(time?: number, velocity = 0.9): void {
    const ctx = audioEngine.getContext();
    const startTime = time || ctx.currentTime;
    const dest = audioEngine.getDestination();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.frequency.setValueAtTime(150, startTime);
    osc.frequency.exponentialRampToValueAtTime(30, startTime + 0.12);

    gain.gain.setValueAtTime(velocity, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(startTime);
    osc.stop(startTime + 0.15);
  }

  // Play snare drum: Sine body + White noise burst
  public static playSnare(time?: number, velocity = 0.85): void {
    const ctx = audioEngine.getContext();
    const startTime = time || ctx.currentTime;
    const dest = audioEngine.getDestination();

    // Body Oscillator
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, startTime);
    osc.frequency.exponentialRampToValueAtTime(80, startTime + 0.1);
    oscGain.gain.setValueAtTime(velocity * 0.7, startTime);
    oscGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);
    osc.connect(oscGain);
    oscGain.connect(dest);
    osc.start(startTime);
    osc.stop(startTime + 0.1);

    // Noise snap
    const bufferSize = ctx.sampleRate * 0.2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(1000, startTime);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(velocity, startTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.18);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(dest);

    noise.start(startTime);
    noise.stop(startTime + 0.18);
  }

  // Play Hi-Hat (Closed / Open)
  public static playHiHat(time?: number, velocity = 0.6, isOpen = false): void {
    const ctx = audioEngine.getContext();
    const startTime = time || ctx.currentTime;
    const dest = audioEngine.getDestination();
    const duration = isOpen ? 0.25 : 0.05;

    const bufferSize = ctx.sampleRate * duration;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7000, startTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(velocity, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    noise.start(startTime);
    noise.stop(startTime + duration);
  }

  // Play Clap
  public static playClap(time?: number, velocity = 0.8): void {
    const ctx = audioEngine.getContext();
    const startTime = time || ctx.currentTime;
    const dest = audioEngine.getDestination();

    const burstTimes = [0, 0.01, 0.02, 0.03];
    for (const offset of burstTimes) {
      const bufferSize = ctx.sampleRate * 0.12;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, startTime + offset);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(velocity * (offset === 0.03 ? 1.0 : 0.4), startTime + offset);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + offset + 0.12);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      noise.start(startTime + offset);
      noise.stop(startTime + offset + 0.12);
    }
  }

  // Play Tom
  public static playTom(time?: number, velocity = 0.8, isHigh = false): void {
    const ctx = audioEngine.getContext();
    const startTime = time || ctx.currentTime;
    const dest = audioEngine.getDestination();
    const startFreq = isHigh ? 220 : 130;
    const endFreq = isHigh ? 90 : 50;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.frequency.setValueAtTime(startFreq, startTime);
    osc.frequency.exponentialRampToValueAtTime(endFreq, startTime + 0.15);

    gain.gain.setValueAtTime(velocity, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.18);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(startTime);
    osc.stop(startTime + 0.18);
  }

  // Trigger drum sample by pad note string
  public static triggerPad(padName: string, time?: number, velocity = 0.8): void {
    const name = padName.toLowerCase();
    switch (name) {
      case 'kick':
        this.playKick(time, velocity);
        break;
      case 'snare':
        this.playSnare(time, velocity);
        break;
      case 'hihat':
      case 'hihat_closed':
        this.playHiHat(time, velocity, false);
        break;
      case 'hihat_open':
        this.playHiHat(time, velocity, true);
        break;
      case 'clap':
        this.playClap(time, velocity);
        break;
      case 'tom1':
      case 'tom_high':
        this.playTom(time, velocity, true);
        break;
      case 'tom2':
      case 'tom_low':
        this.playTom(time, velocity, false);
        break;
      default:
        this.playKick(time, velocity);
        break;
    }
  }
}
