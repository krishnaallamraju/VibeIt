// GestureRecognizer - AI Motion Sensor Gesture Processing Engine

export interface MotionData {
  x: number;
  y: number;
  z: number;
}

export type GestureType = 'strike' | 'shake' | 'tilt_left' | 'tilt_right' | 'none';

export class GestureRecognizer {
  private lastVector = 0;
  private lastStrikeTime = 0;
  private strikeCooldownMs = 180; // Prevent duplicate rapid hits

  // Process 3D acceleration vector magnitude and classify gesture
  public processSensorFrame(accel: MotionData): {
    gesture: GestureType;
    magnitude: number;
    velocity: number;
    mappedNote: string;
  } {
    const { x, y, z } = accel;
    // Calculate 3D vector magnitude
    const magnitude = Math.sqrt(x * x + y * y + z * z);
    const now = Date.now();

    let gesture: GestureType = 'none';
    let mappedNote = 'kick';
    let velocity = 0.5;

    // Detect downward/vertical strike (Acceleration spike above threshold)
    if (magnitude > 16.0 && (now - this.lastStrikeTime) > this.strikeCooldownMs) {
      this.lastStrikeTime = now;
      gesture = 'strike';
      // Higher velocity spike maps to snare, lower spike maps to kick
      if (magnitude > 24.0) {
        mappedNote = 'snare';
        velocity = Math.min(1.0, (magnitude - 10) / 20);
      } else {
        mappedNote = 'kick';
        velocity = Math.min(1.0, (magnitude - 10) / 15);
      }
    } 
    // Detect horizontal shake
    else if (Math.abs(x) > 12.0 && (now - this.lastStrikeTime) > 120) {
      this.lastStrikeTime = now;
      gesture = 'shake';
      mappedNote = 'hihat';
      velocity = Math.min(0.9, Math.abs(x) / 18);
    } 
    // Detect tilt
    else if (y > 6.0) {
      gesture = 'tilt_right';
    } else if (y < -6.0) {
      gesture = 'tilt_left';
    }

    this.lastVector = magnitude;
    return { gesture, magnitude, velocity, mappedNote };
  }
}
