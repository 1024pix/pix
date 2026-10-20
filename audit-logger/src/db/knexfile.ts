import 'ts-node/register';

import { type Knex } from 'knex';

import { config } from '../lib/config.js';

type KnexConfig = {
  development: Knex.Config;
  production: Knex.Config;
  test: Knex.Config;
};

const baseConfiguration = {
  client: 'postgresql',
  connection: config.database.url,
  pool: {
    min: config.database.pool.min,
    max: config.database.pool.max,
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: './migrations',
    extension: 'ts',
  },
  seeds: {
    directory: './seeds',
  },
  asyncStackTraces: config.database.asyncStackTraces,
};

const knexConfigs: KnexConfig = {
  development: baseConfiguration,
  test: baseConfiguration,
  production: baseConfiguration,
};

export default knexConfigs;
