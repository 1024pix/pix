const TABLE_NAME = 'users';

const up = async function(knex) {
  // SQLite does not support altering columns, so we do not try to alter
  // the column if it is already nullable, and we have modified the column
  // creation in the original migration to create it as nullable.

  const info = await knex(TABLE_NAME).columnInfo();
  if (!info.email.nullable) {
    return knex.schema.alterTable(TABLE_NAME, (table) => {
      table.string('email').nullable().alter();
    });
  }
};

const down = function(knex) {
  return knex.schema.alterTable(TABLE_NAME, (table) => {
    table.string('email').notNullable().alter();
  });
};

export { up, down };
