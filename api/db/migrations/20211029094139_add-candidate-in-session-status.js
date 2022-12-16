const TABLE_NAME = 'certification-candidates';
const TITLE_COLUMN = 'authorizedToStart';

exports.up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.boolean(TITLE_COLUMN).notNullable().defaultTo(false);
  });
};

exports.down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(TITLE_COLUMN);
  });
};
