// Sound utility using Web Audio API - no external files needed
const audioContext = typeof window !== 'undefined' ? new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)() : null;

function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3): void {
  if (!audioContext) return;
  
  // Resume if suspended (browser autoplay policy)
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

  gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
}

export function playCorrectSound(): void {
  // Ascending cheerful melody
  playTone(523, 0.15, 'sine', 0.3);
  setTimeout(() => playTone(659, 0.15, 'sine', 0.3), 100);
  setTimeout(() => playTone(784, 0.15, 'sine', 0.3), 200);
  setTimeout(() => playTone(1047, 0.3, 'sine', 0.4), 300);
}

export function playWrongSound(): void {
  // Descending buzz
  playTone(300, 0.2, 'square', 0.2);
  setTimeout(() => playTone(200, 0.3, 'square', 0.2), 150);
}

export function playTileOpenSound(): void {
  // Whoosh effect
  playTone(400, 0.1, 'sine', 0.2);
  setTimeout(() => playTone(800, 0.15, 'sine', 0.15), 50);
}

export function playVictorySound(): void {
  // Triumphant fanfare
  const notes = [523, 659, 784, 1047, 784, 1047, 1319];
  notes.forEach((note, i) => {
    setTimeout(() => playTone(note, 0.25, 'sine', 0.3), i * 150);
  });
}

export function playClickSound(): void {
  playTone(600, 0.05, 'sine', 0.15);
}

export function playFailSound(): void {
  playTone(200, 0.15, 'sawtooth', 0.15);
  setTimeout(() => playTone(150, 0.15, 'sawtooth', 0.15), 100);
  setTimeout(() => playTone(100, 0.4, 'sawtooth', 0.2), 200);
}

