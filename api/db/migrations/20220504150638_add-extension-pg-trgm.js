const up = async function(knex) {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS pg_trgm;');
};

const down = async function(knex) {
  await knex.raw('DROP EXTENSION IF EXISTS pg_trgm;');
};

export { up, down };
