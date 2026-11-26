// Web Audio API calm chime synthesizer for active alarms

class AlarmAudioService {
  private ctx: AudioContext | null = null;
  private intervalId: number | null = null;
  private active = false;

  private playChimeSequence() {
    if (!this.ctx || this.ctx.state === 'closed') return;
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    // Soft warm pentatonic ascending chord: C5, E5, G5, B5
    const notes = [523.25, 659.25, 783.99, 987.77];

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.16);

      const startTime = now + idx * 0.16;
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.14, startTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 1.2);
    });
  }

  public start(): boolean {
    if (typeof window === 'undefined') return false;
    if (this.active) return true;

    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return false;

      if (!this.ctx || this.ctx.state === 'closed') {
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        void this.ctx.resume();
      }

      this.active = true;
      this.playChimeSequence();
      this.intervalId = window.setInterval(() => {
        this.playChimeSequence();
      }, 2400);
      return true;
    } catch {
      return false;
    }
  }

  public stop(): void {
    this.active = false;
    if (this.intervalId !== null && typeof window !== 'undefined') {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.ctx && this.ctx.state !== 'closed') {
      void this.ctx.close().catch(() => {});
      this.ctx = null;
    }
  }

  public isPlaying(): boolean {
    return this.active;
  }
}

export const alarmAudioService = new AlarmAudioService();
