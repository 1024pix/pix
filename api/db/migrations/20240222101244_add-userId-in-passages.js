const TABLE_NAME = 'passages';
const COLUMN_NAME = 'userId';

const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.integer(COLUMN_NAME).nullable();
    table.foreign(COLUMN_NAME).references('users.id');
  });
};

const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};

export { down, up };
