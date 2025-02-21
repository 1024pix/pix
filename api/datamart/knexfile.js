import * as url from 'node:url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
import * as dotenv from 'dotenv';

import { buildPostgresEnvironment } from '../db/utils/build-postgres-environment.js';
dotenv.config({ path: `${__dirname}/../.env` });

const baseConfiguration = {
  migrationsDirectory: './migrations/',
  seedsDirectory: './seeds/',
  databaseUrl: process.env.DATAMART_DATABASE_URL,
  databaseSchema:
    process.env.NODE_ENV === 'test' ? process.env.TEST_DATAMART_DATABASE_SCHEMA : process.env.DATAMART_DATABASE_SCHEMA,
};

const environments = {
  development: buildPostgresEnvironment(baseConfiguration),

  test: buildPostgresEnvironment({ ...baseConfiguration, databaseUrl: process.env.TEST_DATAMART_DATABASE_URL }),

  production: buildPostgresEnvironment(baseConfiguration),
};

export default environments;
