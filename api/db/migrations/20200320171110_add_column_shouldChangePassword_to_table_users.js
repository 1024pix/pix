const TABLE_NAME = 'users';
const SHOULD_CHANGE_PASSWORD_COLUMN = 'shouldChangePassword';
const DEFAULT_VALUE = false;

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.boolean(SHOULD_CHANGE_PASSWORD_COLUMN).notNullable().defaultTo(DEFAULT_VALUE);
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(SHOULD_CHANGE_PASSWORD_COLUMN);
  });
};

