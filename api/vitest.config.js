import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ['./tests/test-helper.js'],
    include: ['tests/**/*test.js'],
    testTimeout: 5_000,
    retry: Number(process.env.VITEST_RETRIES ?? 0),

    // The whole suite shares one live Postgres/Redis/S3-mock and process-wide singletons
    // (knex pool, JobClient/pgBoss, repository caches, RedisMutex). Running files concurrently
    // would cross-contaminate state via databaseBuilder.clean()/datamartBuilder.clean(). CircleCI's
    // own parallelism (sharding acceptance across containers) already provides parallelism.
    fileParallelism: false,
    isolate: false,
    pool: 'forks',

    reporters: process.env.CI
      ? [
          'default',
          [
            'junit',
            {
              outputFile: process.env.VITEST_JUNIT_OUTPUT,
              suiteName: 'pix-api',
              classnameTemplate: '{filepath}',
            },
          ],
        ]
      : ['dot'],
  },
});
