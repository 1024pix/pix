const TABLE_NAME = 'schools';
const COLUMN_NAME = 'sessionExpirationDate';

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

export { down, up };
