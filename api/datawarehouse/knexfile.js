import { buildPostgresEnvironment } from '../db/utils/build-postgres-environment.js';
import { config } from '../src/shared/config.js';

const baseConfiguration = {
  name: 'datawarehouse',
  connection: {
    connectionString: config.database.datawarehouseUrl,
  },
  disableJsonTypesParsing: true,
};

const environments = {
  development: buildPostgresEnvironment(baseConfiguration),
  test: buildPostgresEnvironment(baseConfiguration),
  production: buildPostgresEnvironment(baseConfiguration),
};

export default environments;
