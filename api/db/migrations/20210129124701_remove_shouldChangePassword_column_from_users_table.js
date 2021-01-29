const TABLE_NAME = 'users';
const COLUMN_NAME = 'shouldChangePassword';
const DEFAULT_VALUE = false ;

exports.up = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};

exports.down = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.boolean(COLUMN_NAME).defaultTo(DEFAULT_VALUE);
  });
};
