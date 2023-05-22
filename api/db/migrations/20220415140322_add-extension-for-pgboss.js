const up = async function (knex) {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS pgcrypto;');
};

const down = async function (knex) {
  await knex.raw('DROP EXTENSION IF EXISTS pgcrypto;');
};

export { up, down };
