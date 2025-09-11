let trigger: ((seconds: number) => void) | null = null;

export function registerTrigger(fn: (seconds: number) => void) {
  trigger = fn;
}

export function triggerRateLimit(seconds: number) {
  if (trigger) {
    trigger(seconds);
  }
}