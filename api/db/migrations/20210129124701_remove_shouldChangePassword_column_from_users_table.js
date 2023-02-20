const TABLE_NAME = 'users';
const COLUMN_NAME = 'shouldChangePassword';
const DEFAULT_VALUE = false;

export const up = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};

export const down = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.boolean(COLUMN_NAME).defaultTo(DEFAULT_VALUE);
  });
};
