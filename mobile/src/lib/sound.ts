import { useAudioPlayer } from 'expo-audio';

// Real audio assets replacing the web version's runtime Web Audio
// oscillators (playTone/soundGo/soundTimerEnd in index.html) — see
// scripts/generate-sounds.js for how these were synthesized to match the
// original frequencies/durations.
const tick3 = require('../../assets/sounds/tick-3.wav');
const tick2 = require('../../assets/sounds/tick-2.wav');
const tick1 = require('../../assets/sounds/tick-1.wav');
const goSound = require('../../assets/sounds/go.wav');
const timerTick = require('../../assets/sounds/timer-tick.wav');
const timerUrgent = require('../../assets/sounds/timer-urgent.wav');
const timerEnd = require('../../assets/sounds/timer-end.wav');

export function useGameSounds(enabled: boolean) {
  const pTick3 = useAudioPlayer(tick3);
  const pTick2 = useAudioPlayer(tick2);
  const pTick1 = useAudioPlayer(tick1);
  const pGo = useAudioPlayer(goSound);
  const pTimerTick = useAudioPlayer(timerTick);
  const pTimerUrgent = useAudioPlayer(timerUrgent);
  const pTimerEnd = useAudioPlayer(timerEnd);

  const replay = (player: ReturnType<typeof useAudioPlayer>) => {
    if (!enabled) return;
    try {
      player.seekTo(0);
      player.play();
    } catch {
      // audio backend not ready yet — non-fatal, just skip this cue
    }
  };

  return {
    playCountdownTick: (count: number) => {
      if (count === 3) replay(pTick3);
      else if (count === 2) replay(pTick2);
      else if (count === 1) replay(pTick1);
    },
    playGo: () => replay(pGo),
    playTimerTick: () => replay(pTimerTick),
    playTimerUrgent: () => replay(pTimerUrgent),
    playTimerEnd: () => replay(pTimerEnd),
  };
}
