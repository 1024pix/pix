import { defineConfig } from 'vitest/config';

import { AlphabeticalSequencer } from './tests/setup/vitest-sequencer.js';

const isCI = Boolean(process.env.CI);

const project = (name, setupFile, include, overrides = {}) => ({
  extends: true,
  test: { name, setupFiles: [`./tests/setup/${setupFile}`], include, ...overrides },
});

export default defineConfig({
  test: {
    environment: 'node',

    // Deliberately false: the Mocha-compatible globals (describe/context/it/before*/after*)
    // are injected by tests/setup/vitest-hooks.js, so that `expect` is always chai's and
    // never Vitest's.
    globals: false,

    // A single shared module graph, like today's single Mocha process: the integration setup
    // bootstraps the database and the JobClient once, and repositories, knex pools and
    // feature toggles are module-level singletons.
    // `maxWorkers: 1` + `isolate: false` is what the former `poolOptions.threads.singleThread`
    // became in Vitest 4.
    pool: 'threads',
    maxWorkers: 1,
    minWorkers: 1,
    isolate: false,
    fileParallelism: false,

    // Stable alphabetical file order, like Mocha's glob expansion. Vitest's default sequencer
    // sorts by cached durations, which varies between runs.
    sequence: { sequencer: AlphabeticalSequencer },

    testTimeout: 5000,
    retry: Number(process.env.VITEST_RETRIES ?? 0), // CircleCI sets it to 2 on integration and acceptance
    env: { NODE_ENV: 'test' }, // config/config.js loads tests/setup/.env.test when NODE_ENV=test

    // clearMocks / mockReset / restoreMocks are left at their defaults: they only affect
    // `vi.*` mocks, which are unused here. Sinon is restored by tests/setup/common.js.

    reporters: isCI
      ? // `classname` defaults to the path relative to the root, which is what Mocha's
        // `showRelativePaths` produced and what CircleCI groups timings by.
        ['dot', ['junit', { suiteName: 'pix-api', addFileAttribute: true }]]
      : ['dot'],
    outputFile: { junit: process.env.VITEST_JUNIT_OUTPUT ?? './test-results/test-results.xml' },

    // Always one project per invocation (`--project=…`): tests/setup/unit.js sets fake
    // database URLs at module scope, which would leak into the other projects if they shared
    // a worker.
    projects: [
      // Unit tests touch no database, so nothing forces them to be serial. Each worker gets
      // its own module graph and re-runs the setup file, so the fake connection strings are
      // set per worker. Locally this takes the suite from ~50s to ~32s; 50% measured faster
      // than 100%, where the transform cost of over-subscribed workers outweighs the gain.
      //
      // Serial on CI on purpose: api_unit_test runs on a `small` executor (1 vCPU, 2 GB) and
      // `os.availableParallelism()` reports the host's cores, not the container's cgroup
      // quota — a percentage there would spawn a dozen workers on a single core.
      project('unit', 'vitest-unit.js', ['tests/**/unit/**/*test.{js,ts}'], {
        fileParallelism: !isCI,
        maxWorkers: isCI ? 1 : '50%',
        minWorkers: 1,
      }),
      project('integration', 'vitest-integration.js', ['tests/**/integration/**/*test.{js,ts}']),
      project('acceptance', 'vitest-acceptance.js', ['tests/**/acceptance/**/*test.{js,ts}']),
      // Backs the `modulix:test` script. These tests validate module JSON content, so they run
      // with the unit setup and need no database — including the one that lives under
      // `acceptance/`, which the acceptance project also picks up with a database.
      project('modulix', 'vitest-unit.js', [
        'tests/devcomp/unit/infrastructure/datasources/learning-content/module-datasource_test.js',
        'tests/devcomp/unit/infrastructure/datasources/learning-content/validation/module-validation_test.js',
        'tests/devcomp/unit/infrastructure/repositories/module-repository_test.js',
        'tests/devcomp/acceptance/module-instantiation_test.js',
      ]),
    ],
  },
});
