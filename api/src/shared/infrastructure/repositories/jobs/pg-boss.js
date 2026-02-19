import PgBoss from 'pg-boss';

import { config } from '../../../config.js';

const monitorStateIntervalSeconds = config.pgBoss.monitorStateIntervalSeconds;

export const pgBoss = new PgBoss({
  connectionString: config.pgBoss.databaseUrl,
  max: config.pgBoss.connexionPoolMaxSize,
  ...(monitorStateIntervalSeconds ? { monitorStateIntervalSeconds } : {}),
  archiveFailedAfterSeconds: config.pgBoss.archiveFailedAfterSeconds,
});
