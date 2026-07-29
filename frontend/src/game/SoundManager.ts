/**
 * SoundManager — procedural audio via Web Audio API.
 * No external files needed; generates kid-friendly chimes, power-ups, and effects.
 */
export class SoundManager {
  private ctx: AudioContext | null = null

  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext()
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
    return this.ctx
  }

  /** Happy chime when collecting food */
  playCollect() {
    const ctx = this.getCtx()
    const now = ctx.currentTime
    const notes = [523.25, 659.25, 783.99] // C5, E5, G5 — major triad
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.3, now + i * 0.08)
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.3)
      osc.connect(gain).connect(ctx.destination)
      osc.start(now + i * 0.08)
      osc.stop(now + i * 0.08 + 0.3)
    })
  }

  /** Ascending sparkle for superpower activation */
  playPowerUp() {
    const ctx = this.getCtx()
    const now = ctx.currentTime
    for (let i = 0; i < 8; i++) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.value = 400 + i * 150
      gain.gain.setValueAtTime(0.2, now + i * 0.06)
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.2)
      osc.connect(gain).connect(ctx.destination)
      osc.start(now + i * 0.06)
      osc.stop(now + i * 0.06 + 0.2)
    }
  }

  /** Soft click for UI buttons */
  playClick() {
    const ctx = this.getCtx()
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = 800
    gain.gain.setValueAtTime(0.15, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)
    osc.connect(gain).connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.08)
  }

  /** Gentle descending tone for game over / timeout */
  playGameOver() {
    const ctx = this.getCtx()
    const now = ctx.currentTime
    const notes = [440, 370, 311, 262] // A4, F#4, Eb4, C4
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.25, now + i * 0.25)
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.25 + 0.4)
      osc.connect(gain).connect(ctx.destination)
      osc.start(now + i * 0.25)
      osc.stop(now + i * 0.25 + 0.4)
    })
  }

  /** Short munch sound for eating animation */
  playMunch() {
    const ctx = this.getCtx()
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'square'
    osc.frequency.setValueAtTime(250, now)
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.1)
    gain.gain.setValueAtTime(0.12, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1)
    osc.connect(gain).connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.1)
  }
}

/** Singleton instance shared across scenes */
export const soundManager = new SoundManager()
