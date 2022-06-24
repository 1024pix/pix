exports.up = async function (knex) {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS pgcrypto;');
};

exports.down = async function (knex) {
  await knex.raw('DROP EXTENSION IF EXISTS pgcrypto;');
};
