const INDEX_NAME = 'reset-password-demands_email_lower';

export const up = async (knex) => {
  // eslint-disable-next-line knex/avoid-injections
  await knex.raw(`CREATE INDEX "${INDEX_NAME}" ON "reset-password-demands"(LOWER("email"))`);
  return knex.schema.table('reset-password-demands', function (table) {
    table.dropIndex('email');
  });
};

export const down = async (knex) => {
  await knex.schema.table('reset-password-demands', function (table) {
    table.index('email');
  });

  // eslint-disable-next-line knex/avoid-injections
  return knex.raw(`DROP INDEX "${INDEX_NAME}"`);
};
