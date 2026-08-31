import { buildPostgresEnvironment } from '../db/utils/build-postgres-environment.js';
import { config } from '../src/shared/config.js';

const baseConfiguration = {
  name: 'datamart',
  migrationsDirectory: './migrations/',
  seedsDirectory: './seeds/',
  connection: {
    connectionString: config.database.datamartUrl,
  },
};

const environments = {
  development: buildPostgresEnvironment(baseConfiguration),
  test: buildPostgresEnvironment(baseConfiguration),
  production: buildPostgresEnvironment(baseConfiguration),
};

export default environments;
