// Web Audio API Synthesized Sound Engine
// 100% self-contained, no external audio files required

class SoundEngine {
  private ctx: AudioContext | null = null;
  private ambientSource: AudioNode | null = null;
  private ambientGain: GainNode | null = null;
  private currentPreset: string = 'none';
  private masterVolume: number = 0.5;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setTargetAtTime(this.masterVolume, this.ctx.currentTime, 0.05);
    }
  }

  public stopAmbient() {
    if (this.ambientSource) {
      try {
        if ('stop' in this.ambientSource && typeof (this.ambientSource as AudioScheduledSourceNode).stop === 'function') {
          (this.ambientSource as AudioScheduledSourceNode).stop();
        }
        this.ambientSource.disconnect();
      } catch {
        // ignore disconnect race conditions
      }
      this.ambientSource = null;
    }
    if (this.ambientGain) {
      try {
        this.ambientGain.disconnect();
      } catch {
        // ignore
      }
      this.ambientGain = null;
    }
    this.currentPreset = 'none';
  }

  public playAmbient(preset: 'none' | 'brown' | 'rain' | 'alpha' | 'cafe') {
    this.stopAmbient();
    if (preset === 'none') return;

    const ctx = this.getContext();
    this.currentPreset = preset;

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(this.masterVolume, ctx.currentTime + 1.2);
    gainNode.connect(ctx.destination);
    this.ambientGain = gainNode;

    if (preset === 'brown') {
      // Brown Noise Generator (integrated white noise)
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + 0.02 * white) / 1.02;
        output[i] = lastOut * 3.5;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 400;

      whiteNoise.connect(filter);
      filter.connect(gainNode);
      whiteNoise.start();
      this.ambientSource = whiteNoise;
    } else if (preset === 'rain') {
      // Rain Storm Synthesis
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.4;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.value = 850;
      bandpass.Q.value = 0.8;

      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.value = 1600;

      noise.connect(bandpass);
      bandpass.connect(lowpass);
      lowpass.connect(gainNode);
      noise.start();
      this.ambientSource = noise;
    } else if (preset === 'alpha') {
      // 432Hz Fundamental with 10Hz Binaural Pulse
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.value = 216; // A3 harmonic
      osc2.frequency.value = 226; // 10Hz delta = alpha relaxation frequency

      const subGain = ctx.createGain();
      subGain.gain.value = 0.25;

      osc1.connect(subGain);
      osc2.connect(subGain);
      subGain.connect(gainNode);

      osc1.start();
      osc2.start();

      this.ambientSource = osc1; // primary reference
    } else if (preset === 'cafe') {
      // Cafe Ambience Murmur Filter
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        output[i] = (b0 + b1 + b2) * 0.2;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 450;
      filter.Q.value = 1.2;

      noise.connect(filter);
      filter.connect(gainNode);
      noise.start();
      this.ambientSource = noise;
    }
  }

  // Harmonic Bell Chime on Focus Session Finish
  public playChime() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const harmonics = [528, 1056, 1584, 2112];
      const gains = [0.4, 0.2, 0.1, 0.05];

      harmonics.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(gains[idx] * this.masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 3.0);
      });
    } catch {
      // AudioContext could be blocked by browser gesture rules
    }
  }

  public getActivePreset(): string {
    return this.currentPreset;
  }
}

export const soundEngine = new SoundEngine();
