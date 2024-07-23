import 'dotenv/config';

const up = async function (knex) {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS postgres_fdw;');
  // eslint-disable-next-line knex/avoid-injections
  await knex.raw(
    `CREATE SERVER remote_server FOREIGN DATA WRAPPER postgres_fdw OPTIONS (host '${process.env.REMOTE_DATABASE_HOST}', dbname '${process.env.REMOTE_DATABASE_DBNAME}', port '${process.env.REMOTE_DATABASE_PORT}');`,
  );
  // eslint-disable-next-line knex/avoid-injections
  await knex.raw(
    `CREATE USER MAPPING FOR ${process.env.LOCAL_DATABASE_USER} SERVER remote_tag OPTIONS (user '${process.env.REMOTE_DATABASE_USER}', password '${process.env.REMOTE_DATABASE_PASSWORD}');`,
  );

  await knex.raw(
    `CREATE FOREIGN TABLE tags (
    id integer  NOT NULL,
    name VARCHAR(255) NOT NULL,
    createdAt text NOT NULL TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt text NOT NULL TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) SERVER remote_tag
  OPTIONS (schema_name 'public', table_name 'tags')`,
  );
};

const down = async function (knex) {
  await knex.raw('DROP EXTENSION IF EXISTS postgres_fdw;');
};

export { down, up };
