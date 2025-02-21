export function buildPostgresEnvironment({ databaseUrl, databaseSchema, pool, migrationsDirectory, seedsDirectory }) {
  return {
    client: 'postgresql',
    connection: databaseUrl,
    pool: {
      min: pool?.min || 1,
      max: pool?.max || 4,
    },
    migrations: {
      tableName: 'knex_migrations',
      schemaName: databaseSchema,
      directory: migrationsDirectory,
      loadExtensions: ['.js'],
    },
    seeds: {
      directory: seedsDirectory,
      loadExtensions: ['.js'],
    },
    asyncStackTraces: process.env.KNEX_ASYNC_STACKTRACE_ENABLED !== 'false',
  };
}
