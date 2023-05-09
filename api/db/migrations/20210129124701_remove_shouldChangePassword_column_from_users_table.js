const TABLE_NAME = 'users';
const COLUMN_NAME = 'shouldChangePassword';
const DEFAULT_VALUE = false;

const up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};

const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.boolean(COLUMN_NAME).defaultTo(DEFAULT_VALUE);
  });
};

export { up, down };
