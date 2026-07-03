import { mergeConfig } from 'vitest/config';

import baseConfig from './vitest.config.js';

// Unlike integration/acceptance, unit tests never touch a real Postgres/Redis/S3 connection
// (TEST_DATABASE_URL/TEST_JOBS_DATABASE_URL point at an unreachable host on purpose), so the
// cross-contamination risk that keeps the base config single-threaded doesn't apply here —
// files can safely run concurrently across several forked processes.
export default mergeConfig(baseConfig, {
  test: {
    fileParallelism: true,
    maxForks: 6,
    minForks: 6,
  },
});
