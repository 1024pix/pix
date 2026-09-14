import { defineConfig } from 'vitest/config';

import { AlphabeticalSequencer } from './tests/setup/vitest-sequencer.js';

const isCI = Boolean(process.env.CI);

const project = (name, setupFile, include) => ({
  extends: true,
  test: { name, setupFiles: [`./tests/setup/${setupFile}`], include },
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

    testTimeout: 5000, // .mocharc.cjs `timeout`
    retry: Number(process.env.VITEST_RETRIES ?? 0), // .mocharc.cjs `retries`
    env: { NODE_ENV: 'test' }, // config/config.js loads tests/setup/.env.test when NODE_ENV=test

    // clearMocks / mockReset / restoreMocks are left at their defaults: they only affect
    // `vi.*` mocks, which are unused here. Sinon is restored by tests/setup/common.js.

    reporters: isCI
      ? ['dot', ['junit', { suiteName: 'pix-api', classnameTemplate: '{filepath}', addFileAttribute: true }]]
      : ['dot'],
    outputFile: { junit: process.env.VITEST_JUNIT_OUTPUT ?? './test-results/test-results.xml' },

    // Always one project per invocation (`--project=…`): tests/setup/unit.js sets fake
    // database URLs at module scope, which would leak into the other projects if they shared
    // a worker.
    projects: [
      project('unit', 'vitest-unit.js', ['tests/**/unit/**/*test.{js,ts}']),
      project('integration', 'vitest-integration.js', ['tests/**/integration/**/*test.{js,ts}']),
      project('acceptance', 'vitest-acceptance.js', ['tests/**/acceptance/**/*test.{js,ts}']),
      // Replaces `TEST_SETUP_MODE=unit` in the `modulix:test` script: those tests validate
      // JSON content and must run without a database.
      project('modulix', 'vitest-unit.js', [
        'tests/devcomp/unit/infrastructure/datasources/learning-content/module-datasource_test.js',
        'tests/devcomp/unit/infrastructure/datasources/learning-content/validation/module-validation_test.js',
        'tests/devcomp/unit/infrastructure/repositories/module-repository_test.js',
        'tests/devcomp/acceptance/module-instantiation_test.js',
      ]),
    ],
  },
});
