export class NTPClock {
  private offsetMs = 0;
  private rttHistory: number[] = [];
  private offsetHistory: number[] = [];

  public updateClockOffset(clientTime: number, serverTime: number): void {
    const now = Date.now();
    const rtt = Math.max(0, now - clientTime);
    // Calculated offset: serverTime - (clientTime + RTT / 2)
    const calculatedOffset = serverTime - (clientTime + rtt / 2);

    this.rttHistory.push(rtt);
    if (this.rttHistory.length > 10) this.rttHistory.shift();

    this.offsetHistory.push(calculatedOffset);
    if (this.offsetHistory.length > 10) this.offsetHistory.shift();

    // Rolling average offset to eliminate network jitter spikes
    const sumOffset = this.offsetHistory.reduce((a, b) => a + b, 0);
    this.offsetMs = sumOffset / this.offsetHistory.length;
  }

  public getOffset(): number {
    return this.offsetMs;
  }

  public getMasterTime(): number {
    return Date.now() + this.offsetMs;
  }

  public getAverageRTT(): number {
    if (this.rttHistory.length === 0) return 0;
    return Math.round(this.rttHistory.reduce((a, b) => a + b, 0) / this.rttHistory.length);
  }
}

export const ntpClock = new NTPClock();
