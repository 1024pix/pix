const TABLE_NAME = 'users';
const COLUMN_NAME = 'lastLoggedAt';

const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};

const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dateTime(COLUMN_NAME).defaultTo(null);
  });
};

export { up, down };
