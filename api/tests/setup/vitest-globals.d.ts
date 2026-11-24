// Types for the globals injected at runtime by tests/setup/vitest-hooks.js.
// Kept in sync by hand with its `Object.assign(globalThis, ...)`: `vitest/globals` is not
// used because it would also declare Vitest's `expect`, which the suite must never use.
import type * as vitest from 'vitest';

declare global {
  const describe: typeof vitest.describe;
  const context: typeof vitest.describe;
  const it: typeof vitest.it;
  const beforeEach: typeof vitest.beforeEach;
  const afterEach: typeof vitest.afterEach;
  const beforeAll: typeof vitest.beforeAll;
  const afterAll: typeof vitest.afterAll;
}
