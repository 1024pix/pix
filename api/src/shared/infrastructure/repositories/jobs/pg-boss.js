import PgBoss from 'pg-boss';

import { config } from '../../../config.js';

const monitorStateIntervalSeconds = config.pgBoss.monitorStateIntervalSeconds;

export const pgBoss = new PgBoss({
  schema: 'pgboss_v10',
  connectionString: config.pgBoss.databaseUrl,
  max: config.pgBoss.connexionPoolMaxSize,
  ...(monitorStateIntervalSeconds ? { monitorStateIntervalSeconds } : {}),
  archiveFailedAfterSeconds: config.pgBoss.archiveFailedAfterSeconds,
});
