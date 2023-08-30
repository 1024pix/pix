const TABLE_NAME = 'user-logins';
const COLUMN_NAME = 'lastLoggedAt';

const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dateTime(COLUMN_NAME).defaultTo(null);
  });
};

const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};

export { up, down };
