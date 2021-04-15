const INDEX_NAME = 'reset-password-demands_email_lower';

exports.up = async (knex) => {
  await knex.raw(`CREATE INDEX "${INDEX_NAME}" ON "reset-password-demands"(LOWER("email"))`);
  return knex.schema.table('reset-password-demands', function(table) {
    table.dropIndex('email');
  });
};

exports.down = async (knex) => {
  await knex.schema.table('reset-password-demands', function(table) {
    table.index('email');
  });

  return knex.raw(`DROP INDEX "${INDEX_NAME}"`);
};
