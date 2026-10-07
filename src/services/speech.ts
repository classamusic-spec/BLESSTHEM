/**
 * Read-aloud using the device’s own speech voices (Bless Them+).
 * Never autoplays. Prefers natural/premium English voices when available.
 */

export function speechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

const PREFERRED = [
  /natural/i, /premium/i, /enhanced/i, /neural/i,
  /^Samantha/, /^Ava/, /^Allison/, /^Serena/, /^Daniel/, /^Karen/, /^Moira/,
  /Google US English/, /Google UK English Female/, /Microsoft (Aria|Jenny|Guy|Sonia)/,
];

export function listVoices(): SpeechSynthesisVoice[] {
  if (!speechSupported()) return [];
  return window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('en'));
}

export function bestVoice(preferredURI?: string): SpeechSynthesisVoice | undefined {
  const voices = listVoices();
  if (preferredURI) {
    const chosen = voices.find((v) => v.voiceURI === preferredURI);
    if (chosen) return chosen;
  }
  for (const re of PREFERRED) {
    const v = voices.find((voice) => re.test(voice.name));
    if (v) return v;
  }
  return voices.find((v) => v.lang === 'en-US') ?? voices[0];
}

/** Resolves once voices are available (Chrome loads them asynchronously). */
export function voicesReady(): Promise<void> {
  if (!speechSupported()) return Promise.resolve();
  if (window.speechSynthesis.getVoices().length) return Promise.resolve();
  return new Promise((resolve) => {
    const done = () => resolve();
    window.speechSynthesis.addEventListener('voiceschanged', done, { once: true });
    setTimeout(done, 1200);
  });
}

export interface SpeakHandle {
  stop(): void;
  pause(): void;
  resume(): void;
}

export function speak(
  text: string,
  opts: { rate?: number; voiceURI?: string; onProgress?: (fraction: number) => void; onEnd?: () => void } = {},
): SpeakHandle {
  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const voice = bestVoice(opts.voiceURI);
  if (voice) utterance.voice = voice;
  utterance.lang = voice?.lang ?? 'en-US';
  utterance.rate = opts.rate ?? 0.95;
  utterance.pitch = 1;
  utterance.onboundary = (e) => opts.onProgress?.(Math.min(1, (e.charIndex + (e.charLength ?? 0)) / text.length));
  utterance.onend = () => {
    opts.onProgress?.(1);
    opts.onEnd?.();
  };
  utterance.onerror = () => opts.onEnd?.();
  synth.speak(utterance);
  return {
    stop: () => synth.cancel(),
    pause: () => synth.pause(),
    resume: () => synth.resume(),
  };
}

/** Makes Scripture references and stage directions read naturally. */
export function speakableReference(display: string): string {
  return display.replace(/(\d+):(\d+)–(\d+)/, '$1, verses $2 to $3').replace(/(\d+):(\d+)/, '$1, verse $2');
}
