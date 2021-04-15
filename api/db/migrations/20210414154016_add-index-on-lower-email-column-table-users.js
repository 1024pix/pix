const INDEX_NAME = 'users_email_lower';

exports.up = (knex) => {
  return knex.raw(`CREATE INDEX "${INDEX_NAME}" ON "users"(LOWER("email"))`);
};

exports.down = (knex) => {
  return knex.raw(`DROP INDEX "${INDEX_NAME}"`);
};
