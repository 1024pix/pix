import { defineConfig } from 'vitest/config';

import { loadEnvFileIfExists } from './src/shared/load-env-file-if-exists.js';

loadEnvFileIfExists();

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ['./tests/test-helper.js'],
    testTimeout: 5000,
    retry: Number(process.env.VITEST_RETRIES ?? 0),
    isolate: false,
    fileParallelism: false,
    env: { NODE_ENV: 'test' },
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['tests/**/unit/**/*test.js'],
          setupFiles: ['./tests/setup-unit.js'],
          sequence: { groupOrder: 1 },
          env: {
            TEST_DATABASE_URL: 'postgres://should.not.reach.db.in.unit.tests',
            TEST_REDIS_URL: '',
            TEST_JOBS_DATABASE_URL: 'postgres://should.not.reach.db.in.unit.tests',
          },
        },
      },
      {
        extends: true,
        test: {
          name: 'integration',
          include: ['tests/**/integration/**/*test.js'],
          setupFiles: ['./tests/setup-integ.js'],
          sequence: { groupOrder: 2 },
        },
      },
      {
        extends: true,
        test: {
          name: 'acceptance',
          include: ['tests/**/acceptance/**/*test.js'],
          setupFiles: ['./tests/setup-integ.js'],
          sequence: { groupOrder: 3 },
        },
      },
    ],
    reporters: process.env.CI
      ? [
          'dot',
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
