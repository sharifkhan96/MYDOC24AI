// A soft, generated ambient pad, entirely synthesized in the browser via the
// Web Audio API. No audio files, no external URLs, no copyrighted material:
// just two gently detuned oscillators through a low-pass filter, faded in
// and out to avoid clicks.
export class AmbientTone {
  private context: AudioContext | null = null;
  private gain: GainNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private playing = false;

  start(volume = 0.06) {
    if (this.playing) return;
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const gain = ctx.createGain();
    gain.gain.value = 0;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 800;
    gain.connect(filter).connect(ctx.destination);

    const frequencies = [110, 165, 220];
    const oscillators = frequencies.map((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq + (i === 1 ? 0.6 : 0);
      osc.connect(gain);
      osc.start();
      return osc;
    });

    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 1.5);

    this.context = ctx;
    this.gain = gain;
    this.oscillators = oscillators;
    this.playing = true;
  }

  stop() {
    if (!this.playing || !this.context || !this.gain) return;
    const ctx = this.context;
    const gain = this.gain;
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
    const oscillators = this.oscillators;
    setTimeout(() => {
      oscillators.forEach((osc) => osc.stop());
      ctx.close();
    }, 900);
    this.playing = false;
    this.context = null;
    this.gain = null;
    this.oscillators = [];
  }

  get isPlaying() {
    return this.playing;
  }
}
