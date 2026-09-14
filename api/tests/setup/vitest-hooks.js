import { afterAll, afterEach, beforeAll, beforeEach, describe, it } from 'vitest';

const INITIALIZED = Symbol.for('pix.vitest.setup.initialized');

// Vitest runs with `globals: false`: we inject only the globals the suite actually relies
// on, so that `expect` always resolves to the chai import present in the test file and can
// never silently fall back to Vitest's own `expect`.
//
// `context` is Mocha's alias for `describe` (5299 call sites), and `before`/`after` are its
// aliases for `beforeAll`/`afterAll` (38 call sites, aliased rather than renamed so that the
// runner swap touches no test file).
Object.assign(globalThis, {
  describe,
  context: describe,
  it,
  beforeEach,
  afterEach,
  beforeAll,
  afterAll,
  before: beforeAll,
  after: afterAll,
});

/**
 * Registers a Mocha root hook plugin object — `{ beforeAll, afterEach, afterAll }`, where
 * each value is a function or an array of functions — as Vitest hooks.
 *
 * `mochaHooks.afterAll` is deliberately ignored, see the note at the bottom of this file.
 *
 * @param {{ beforeAll?: Function | Function[], afterEach?: Function | Function[] }} mochaHooks
 */
export function registerMochaHooks(mochaHooks) {
  const setupHooks = [mochaHooks.beforeAll ?? []].flat();
  const cleanupHooks = [mochaHooks.afterEach ?? []].flat();

  if (setupHooks.length > 0) {
    beforeAll(async () => {
      // Setup files are re-executed before *every* test file, even with `isolate: false`
      // (only the modules they import are cached). The suite-wide bootstrap — emptying the
      // database, starting pg-boss — must therefore run only once.
      if (globalThis[INITIALIZED]) return;
      globalThis[INITIALIZED] = true;

      for (const hook of setupHooks) await hook();
    });
  }

  if (cleanupHooks.length > 0) {
    // Registered as a single hook so the sub-hooks keep running in declaration order.
    // Vitest's `sequence.hooks` defaults to 'stack', which runs hooks registered on the same
    // suite in reverse order — that would run the database cleanup before `sinon.restore()`.
    afterEach(async () => {
      for (const hook of cleanupHooks) await hook();
    });
  }
}

// `mochaHooks.afterAll` (releaseInfrastructure) is not wired on purpose. With
// `isolate: false` a setup-file `afterAll` runs after every test file, and
// `releaseInfrastructure` latches itself closed after its first call: the very first file
// would tear down knex, pg-boss and redis for all the following ones. `globalSetup` is not
// an alternative either, as it runs in the main thread with its own module registry and
// therefore holds different JobClient and knex instances. Mocha already ran with
// `exit: true` (force-exit with open handles); with `pool: 'threads'` the worker is
// terminated at the end of the run, which is equivalent.
