import { setTimeout } from 'node:timers/promises';

export function wait(ms) {
  return setTimeout(ms);
}

export function waitForStreamFinalizationToBeDone() {
  return wait(50);
}

export async function waitFor(condition, pollInterval = 50, timeoutAfter = 500) {
  const startTime = Date.now();

  while (true) {
    if (typeof timeoutAfter === 'number' && Date.now() > startTime + timeoutAfter) {
      throw 'Condition not met before timeout';
    }

    const result = await condition();

    if (result) {
      return result;
    }

    await wait(pollInterval);
  }
}
