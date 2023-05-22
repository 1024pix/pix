const INDEX_NAME = 'users_email_lower';

const up = function (knex) {
  // eslint-disable-next-line knex/avoid-injections
  return knex.raw(`CREATE INDEX "${INDEX_NAME}" ON "users"(LOWER("email"))`);
};

const down = function (knex) {
  // eslint-disable-next-line knex/avoid-injections
  return knex.raw(`DROP INDEX "${INDEX_NAME}"`);
};

export { up, down };
