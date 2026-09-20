// Synthesizes the game's short sound effects as real WAV files, since the
// web version generated them at runtime with Web Audio oscillators (no
// equivalent API exists in React Native). Frequencies/durations/envelopes
// mirror index.html's playTone/soundGo/soundTimerEnd exactly.
// Run with: node scripts/generate-sounds.js
const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;

function waveSample(type, phase) {
  const t = phase - Math.floor(phase); // 0..1
  switch (type) {
    case 'sine':
      return Math.sin(2 * Math.PI * t);
    case 'square':
      return t < 0.5 ? 1 : -1;
    default:
      return Math.sin(2 * Math.PI * t);
  }
}

// Renders one oscillator voice into `buf` (Float32Array), additively mixed,
// starting at `startSec`, with linear/exponential-ish gain envelope.
function renderVoice(buf, { type = 'sine', freq, freqEnd, startSec = 0, duration, peakVolume, attack = 0.005 }) {
  const startSample = Math.floor(startSec * SAMPLE_RATE);
  const totalSamples = Math.floor(duration * SAMPLE_RATE);
  let phase = 0;
  for (let i = 0; i < totalSamples; i++) {
    const idx = startSample + i;
    if (idx >= buf.length) break;
    const tSec = i / SAMPLE_RATE;
    const f = freqEnd !== undefined ? freq + (freqEnd - freq) * (tSec / duration) : freq;
    phase += f / SAMPLE_RATE;
    const raw = waveSample(type, phase);
    // envelope: quick linear attack, then exponential-ish decay to ~0
    const attackGain = attack > 0 ? Math.min(1, tSec / attack) : 1;
    const decayGain = Math.pow(1 - tSec / duration, 1.6);
    const gain = peakVolume * attackGain * Math.max(0, decayGain);
    buf[idx] += raw * gain;
  }
}

function toWavBuffer(floatBuf) {
  const numSamples = floatBuf.length;
  const bytesPerSample = 2;
  const blockAlign = bytesPerSample;
  const byteRate = SAMPLE_RATE * blockAlign;
  const dataSize = numSamples * bytesPerSample;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // fmt chunk size
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(1, 22); // mono
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34); // bits per sample
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < numSamples; i++) {
    let s = Math.max(-1, Math.min(1, floatBuf[i]));
    buffer.writeInt16LE(Math.round(s * 32767), 44 + i * 2);
  }
  return buffer;
}

function renderClip(totalDuration, voices) {
  const buf = new Float32Array(Math.ceil(totalDuration * SAMPLE_RATE) + SAMPLE_RATE * 0.05);
  voices.forEach((v) => renderVoice(buf, v));
  return toWavBuffer(buf);
}

const outDir = path.join(__dirname, '..', 'assets', 'sounds');
fs.mkdirSync(outDir, { recursive: true });

const clips = {
  // countdown ticks — mirrors soundCountdownTick's freqs=[0,880,660,440]
  // (count 3 -> 440Hz, 2 -> 660Hz, 1 -> 880Hz, rising pitch toward GO)
  'tick-3.wav': renderClip(0.14, [{ type: 'sine', freq: 440, duration: 0.12, peakVolume: 0.5 }]),
  'tick-2.wav': renderClip(0.14, [{ type: 'sine', freq: 660, duration: 0.12, peakVolume: 0.5 }]),
  'tick-1.wav': renderClip(0.14, [{ type: 'sine', freq: 880, duration: 0.12, peakVolume: 0.5 }]),
  // "GO!" — three-note ascending chime C5, G5, C6, staggered 100ms apart
  'go.wav': renderClip(0.55, [
    { type: 'sine', freq: 523, duration: 0.4, peakVolume: 0.5, startSec: 0 },
    { type: 'sine', freq: 784, duration: 0.4, peakVolume: 0.5, startSec: 0.1 },
    { type: 'sine', freq: 1046, duration: 0.4, peakVolume: 0.5, startSec: 0.2 },
  ]),
  'timer-tick.wav': renderClip(0.08, [{ type: 'square', freq: 1200, duration: 0.06, peakVolume: 0.2 }]),
  'timer-urgent.wav': renderClip(0.1, [{ type: 'square', freq: 1600, duration: 0.08, peakVolume: 0.3 }]),
  'timer-end.wav': renderClip(0.7, [{ type: 'sine', freq: 400, freqEnd: 80, duration: 0.65, peakVolume: 0.5, attack: 0.01 }]),
};

for (const [name, buf] of Object.entries(clips)) {
  fs.writeFileSync(path.join(outDir, name), buf);
  console.log('wrote', name, `(${buf.length} bytes)`);
}
