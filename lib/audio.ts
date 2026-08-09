/**
 * Het geluid op deze site, met de Web Audio API en verder niets. Geen
 * samples, geen bibliotheek: elke klank wordt ter plekke gesynthetiseerd uit
 * een oscillator of een ruisbuffer.
 *
 * Het belangrijkste idee is de scheiding van twee klokken. Het tekenwerk
 * loopt op `requestAnimationFrame`, dat een paar milliseconden kan schommelen
 * — voor het oog onzichtbaar, voor het oor niet. Muzikale gebeurtenissen
 * worden daarom niet gespeeld op het moment dat het frame draait, maar
 * ingepland op de audioklok, een eindje vooruit. Elk frame kijkt een stukje
 * de toekomst in en zet klaar wat binnen dat venster valt.
 */

/** Hoe ver vooruit een simulatie mag inplannen. Ruim boven één frame. */
export const LOOKAHEAD = 0.12;

export type NoteOptions = {
  /** Uitsterftijd in seconden. */
  decay?: number;
  /** Luidheid, 0–1. */
  gain?: number;
  /** Golfvorm. */
  type?: OscillatorType;
  /** Hoeveel er naar de nagalm gaat, 0–1. */
  send?: number;
  /** Een tweede, hoger boventoontje — geeft hout of metaal. */
  partial?: number;
};

export class AudioBus {
  private ctx: AudioContext;
  private master: GainNode;
  private dry: GainNode;
  private wet: GainNode;
  private noiseBuffer: AudioBuffer;

  constructor() {
    this.ctx = new AudioContext();

    this.master = this.ctx.createGain();
    this.master.gain.value = 0.7;
    this.master.connect(this.ctx.destination);

    this.dry = this.ctx.createGain();
    this.dry.gain.value = 1;
    this.dry.connect(this.master);

    // Een korte kunstmatige nagalm. Zonder ruimte klinkt een kale oscillator
    // als een pieptoon; met een beetje staart wordt het een instrument.
    const convolver = this.ctx.createConvolver();
    convolver.buffer = this.impulse(1.6, 2.6);
    this.wet = this.ctx.createGain();
    this.wet.gain.value = 1;
    this.wet.connect(convolver);
    convolver.connect(this.master);

    this.noiseBuffer = this.noise(1);
  }

  /** Een ruisstaart die exponentieel uitdooft, als impulsantwoord. */
  private impulse(seconds: number, falloff: number): AudioBuffer {
    const rate = this.ctx.sampleRate;
    const length = Math.floor(rate * seconds);
    const buffer = this.ctx.createBuffer(2, length, rate);
    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        const t = i / length;
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, falloff);
      }
    }
    return buffer;
  }

  private noise(seconds: number): AudioBuffer {
    const rate = this.ctx.sampleRate;
    const length = Math.floor(rate * seconds);
    const buffer = this.ctx.createBuffer(1, length, rate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  /** De audioklok. Alles wordt hierop ingepland, niet op de framelus. */
  get now(): number {
    return this.ctx.currentTime;
  }

  get state(): AudioContextState {
    return this.ctx.state;
  }

  setVolume(value: number): void {
    // Een korte ramp in plaats van een sprong; anders klikt het.
    this.master.gain.setTargetAtTime(value, this.ctx.currentTime, 0.02);
  }

  async resume(): Promise<void> {
    if (this.ctx.state !== "running") await this.ctx.resume();
  }

  async suspend(): Promise<void> {
    if (this.ctx.state === "running") await this.ctx.suspend();
  }

  close(): void {
    void this.ctx.close();
  }

  /**
   * Eén toon op een exact tijdstip. Een oscillator plus een envelope die
   * meteen begint uit te doven — genoeg voor bellen, marimba's en plukken.
   */
  note(time: number, freq: number, options: NoteOptions = {}): void {
    const {
      decay = 0.6,
      gain = 0.2,
      type = "sine",
      send = 0.25,
      partial = 0,
    } = options;

    const at = Math.max(time, this.ctx.currentTime);
    const envelope = this.ctx.createGain();

    // Een aanslag van een paar milliseconden voorkomt een plof aan het begin.
    envelope.gain.setValueAtTime(0, at);
    envelope.gain.linearRampToValueAtTime(gain, at + 0.004);
    envelope.gain.exponentialRampToValueAtTime(0.0001, at + decay);

    const osc = this.ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, at);
    osc.connect(envelope);
    osc.start(at);
    osc.stop(at + decay + 0.05);

    if (partial > 0) {
      const upper = this.ctx.createOscillator();
      upper.type = "sine";
      upper.frequency.setValueAtTime(freq * 2.76, at);
      const upperGain = this.ctx.createGain();
      upperGain.gain.setValueAtTime(partial, at);
      upper.connect(upperGain);
      upperGain.connect(envelope);
      upper.start(at);
      upper.stop(at + decay * 0.5);
    }

    envelope.connect(this.dry);
    if (send > 0) {
      const sendGain = this.ctx.createGain();
      sendGain.gain.value = send;
      envelope.connect(sendGain);
      sendGain.connect(this.wet);
    }
  }

  /** Een korte ruistik: bekken, shaker, klap. */
  hit(
    time: number,
    options: { decay?: number; gain?: number; highpass?: number; send?: number } = {},
  ): void {
    const { decay = 0.08, gain = 0.15, highpass = 2000, send = 0.15 } = options;
    const at = Math.max(time, this.ctx.currentTime);

    const source = this.ctx.createBufferSource();
    source.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = highpass;

    const envelope = this.ctx.createGain();
    envelope.gain.setValueAtTime(gain, at);
    envelope.gain.exponentialRampToValueAtTime(0.0001, at + decay);

    source.connect(filter);
    filter.connect(envelope);
    envelope.connect(this.dry);

    if (send > 0) {
      const sendGain = this.ctx.createGain();
      sendGain.gain.value = send;
      envelope.connect(sendGain);
      sendGain.connect(this.wet);
    }

    source.start(at);
    source.stop(at + decay + 0.02);
  }
}

/* ------------------------------------------------------------------ *
 * Toonhoogtes
 * ------------------------------------------------------------------ */

/** Halve tonen boven de grondtoon, voor een pentatonische ladder. */
const PENTATONIEK = [0, 2, 4, 7, 9];

/**
 * De n-de trede van een pentatonische ladder, in hertz. Pentatonisch omdat
 * er geen combinatie van tonen bestaat die lelijk klinkt — handig als de
 * volgorde door een simulatie wordt bepaald en niet door een componist.
 */
export function toonhoogte(trede: number, grondtoon = 220): number {
  const octaaf = Math.floor(trede / PENTATONIEK.length);
  const stap = PENTATONIEK[((trede % PENTATONIEK.length) + PENTATONIEK.length) % PENTATONIEK.length];
  return grondtoon * Math.pow(2, octaaf + stap / 12);
}
