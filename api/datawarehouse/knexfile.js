import { buildPostgresEnvironment, setConnectionString } from '../db/utils/build-postgres-environment.js';
import { loadEnvFileIfExists } from '../src/shared/load-env-file-if-exists.js';

loadEnvFileIfExists();

const baseConfiguration = {
  name: 'datawarehouse',
  connection: {
    connectionString: process.env.DATAWAREHOUSE_DATABASE_URL,
  },
  disableJsonTypesParsing: true,
};

const environments = {
  development: buildPostgresEnvironment(baseConfiguration),
  test: setConnectionString(process.env.TEST_DATAWAREHOUSE_DATABASE_URL, buildPostgresEnvironment(baseConfiguration)),
  production: buildPostgresEnvironment(baseConfiguration),
};

export default environments;
