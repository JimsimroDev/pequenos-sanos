/**
 * SoundManager — procedural audio for Pequeños Sanos.
 *
 * All sounds are synthesized with the Web Audio API (no external files):
 *   - SFX: collect, munch, power-up, click, game-over, step
 *   - Background music: "Sunny Farm Meadow" — lofi, D major, 88 BPM,
 *     progression I-IV-vi-V, synthesized ukulele/flute/xilophone/bass.
 *
 * A master music gain and a master SFX gain allow independent muting.
 */
export class SoundManager {
  private ctx: AudioContext
  private musicGain: GainNode
  private sfxGain: GainNode
  private muted = false

  // Music scheduler state
  private musicTimer: number | null = null
  private nextNoteTime = 0
  private beatIndex = 0
  private readonly LOOKAHEAD = 0.12
  private readonly SCHEDULE_INTERVAL = 25
  private readonly BPM = 88
  private get beatDur() { return 60 / this.BPM }

  // Chords (MIDI roots + triads) for I IV vi V in D major
  private readonly CHORDS: number[][] = [
    [50, 62, 66, 69], // I  D  (D3, D4 F#4 A4)
    [55, 67, 71, 74], // IV G  (G3, G4 B4 D5)
    [59, 71, 74, 78], // vi Bm (B3, B4 D5 F#5)
    [57, 69, 73, 76], // V  A  (A3, A4 C#5 E5)
  ]

  // Melody (one note per beat, 16 beats = one full pass)
  private readonly MELODY_A: number[] = [
    74, 69, 66, 62, 67, 74, 71, 69, 71, 74, 78, 76, 69, 73, 74, 69,
  ]
  private readonly MELODY_B: number[] = [
    74, 71, 69, 66, 67, 74, 71, 69, 73, 76, 78, 74, 71, 69, 66, 62,
  ]
  private melodyVariant = 0

  constructor() {
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    this.musicGain = this.ctx.createGain()
    this.musicGain.gain.value = 0.32
    this.musicGain.connect(this.ctx.destination)
    this.sfxGain = this.ctx.createGain()
    this.sfxGain.gain.value = 0.5
    this.sfxGain.connect(this.ctx.destination)
  }

  private midiToFreq(midi: number): number {
    return 440 * Math.pow(2, (midi - 69) / 12)
  }

  private playTone(freq: number, duration: number, type: OscillatorType, gain: number, dest: AudioNode, attack = 0.01) {
    const osc = this.ctx.createOscillator()
    const g = this.ctx.createGain()
    osc.type = type
    osc.frequency.value = freq
    g.gain.setValueAtTime(0, this.ctx.currentTime)
    g.gain.linearRampToValueAtTime(gain, this.ctx.currentTime + attack)
    g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration)
    osc.connect(g)
    g.connect(dest)
    osc.start()
    osc.stop(this.ctx.currentTime + duration + 0.05)
  }

  // ---------- SFX ----------

  playCollect() {
    const notes = [523.25, 659.25, 783.99]
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.15, 'sine', 0.25, this.sfxGain), i * 80)
    })
  }

  playMunch() {
    this.playTone(300, 0.08, 'square', 0.12, this.sfxGain)
  }

  playPowerUp() {
    const notes = [523.25, 659.25, 783.99, 1046.5]
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.12, 'triangle', 0.2, this.sfxGain), i * 60)
    })
  }

  playClick() {
    this.playTone(800, 0.05, 'square', 0.15, this.sfxGain)
  }

  playGameOver() {
    const notes = [392, 330, 262, 196]
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.3, 'sawtooth', 0.18, this.sfxGain), i * 200)
    })
  }

  playStep() {
    this.playTone(180 + Math.random() * 40, 0.06, 'triangle', 0.07, this.sfxGain)
  }

  // ---------- Music ----------

  startMusic() {
    if (this.musicTimer !== null) return
    if (this.ctx.state === 'suspended') this.ctx.resume()
    this.nextNoteTime = this.ctx.currentTime + 0.1
    this.beatIndex = 0
    this.melodyVariant = 0
    this.musicTimer = window.setInterval(() => this.scheduleMusic(), this.SCHEDULE_INTERVAL)
  }

  stopMusic() {
    if (this.musicTimer !== null) {
      clearInterval(this.musicTimer)
      this.musicTimer = null
    }
  }

  private scheduleMusic() {
    while (this.nextNoteTime < this.ctx.currentTime + this.LOOKAHEAD) {
      this.scheduleBeat(this.beatIndex, this.nextNoteTime)
      this.beatIndex++
      this.nextNoteTime += this.beatDur
      // Swap melody variant every 2 passes (32 beats)
      if (this.beatIndex % 32 === 0) this.melodyVariant = (this.melodyVariant + 1) % 2
    }
  }

  private scheduleBeat(beat: number, time: number) {
    const chordIdx = Math.floor((beat % 16) / 4)
    const chord = this.CHORDS[chordIdx]
    const root = chord[0]
    const beatInBar = beat % 4
    const melodyArr = this.melodyVariant === 0 ? this.MELODY_A : this.MELODY_B
    const melNote = melodyArr[beat % 16]

    // Bass: root note on every beat (octave 2)
    this.scheduleNote(this.midiToFreq(root - 12), time, this.beatDur * 0.85, 'sine', 0.13, this.musicGain)

    // Melody (flute): one note per beat
    this.scheduleNote(this.midiToFreq(melNote), time, this.beatDur * 0.75, 'sine', 0.09, this.musicGain)

    // Ukulele arpeggio: only on beat 0 of each bar
    if (beatInBar === 0) {
      chord.slice(1).forEach((note, i) => {
        this.scheduleNote(this.midiToFreq(note), time + i * 0.09, 0.22, 'triangle', 0.07, this.musicGain)
      })
    }

    // Xylophone sparkle: beats 0 and 2, high octave
    if (beatInBar === 0 || beatInBar === 2) {
      this.scheduleNote(this.midiToFreq(melNote + 12), time + 0.02, 0.12, 'sine', 0.05, this.musicGain)
    }
  }

  private scheduleNote(freq: number, time: number, duration: number, type: OscillatorType, gain: number, dest: AudioNode) {
    const osc = this.ctx.createOscillator()
    const g = this.ctx.createGain()
    osc.type = type
    osc.frequency.value = freq
    // Soft vibrato on sine (flute) notes
    if (type === 'sine') {
      const lfo = this.ctx.createOscillator()
      const lfoGain = this.ctx.createGain()
      lfo.frequency.value = 5.5
      lfoGain.gain.value = 3
      lfo.connect(lfoGain)
      lfoGain.connect(osc.frequency)
      lfo.start(time)
      lfo.stop(time + duration + 0.05)
    }
    g.gain.setValueAtTime(0, time)
    g.gain.linearRampToValueAtTime(gain, time + 0.015)
    g.gain.exponentialRampToValueAtTime(0.0001, time + duration)
    osc.connect(g)
    g.connect(dest)
    osc.start(time)
    osc.stop(time + duration + 0.05)
  }

  // ---------- Mute / volume ----------

  setMuted(muted: boolean) {
    this.muted = muted
    const v = muted ? 0 : 1
    this.musicGain.gain.setTargetAtTime(this.muted ? 0 : 0.32, this.ctx.currentTime, 0.05)
    this.sfxGain.gain.setTargetAtTime(this.muted ? 0 : 0.5, this.ctx.currentTime, 0.05)
    void v
  }

  isMuted() { return this.muted }

  toggleMute() { this.setMuted(!this.muted); return this.muted }
}

export const soundManager = new SoundManager()
