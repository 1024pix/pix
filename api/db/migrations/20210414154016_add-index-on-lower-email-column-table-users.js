const INDEX_NAME = 'users_email_lower';

export const up = (knex) => {
  // eslint-disable-next-line knex/avoid-injections
  return knex.raw(`CREATE INDEX "${INDEX_NAME}" ON "users"(LOWER("email"))`);
};

export const down = (knex) => {
  // eslint-disable-next-line knex/avoid-injections
  return knex.raw(`DROP INDEX "${INDEX_NAME}"`);
};
