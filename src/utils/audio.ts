/**
 * Web Audio API synthesize beeps and cues for rest timers and interval milestones
 */

class SoundEffects {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playBeep(frequency: number = 880, durationMs: number = 150, type: OscillatorType = 'sine') {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + durationMs / 1000);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + durationMs / 1000);
    } catch {
      // Audio autoplay policy catch
    }
  }

  playCountdownTick() {
    this.playBeep(659.25, 80, 'sine');
  }

  playRestComplete() {
    this.playBeep(880, 120, 'triangle');
    setTimeout(() => this.playBeep(1174.66, 250, 'triangle'), 150);
  }

  playExerciseComplete() {
    this.playBeep(587.33, 100, 'sine');
    setTimeout(() => this.playBeep(880, 200, 'sine'), 120);
  }

  playWorkoutFinish() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((note, index) => {
      setTimeout(() => this.playBeep(note, 200, 'triangle'), index * 120);
    });
  }
}

export const sounds = new SoundEffects();
