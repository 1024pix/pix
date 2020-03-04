const TABLE_NAME = 'user-orga-settings';
const CREATED_AT_COLUMN = 'createdAt';
const UPDATED_AT_COLUMN = 'updatedAt';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dateTime(CREATED_AT_COLUMN).notNullable().defaultTo(knex.fn.now());
    table.dateTime(UPDATED_AT_COLUMN).notNullable().defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(UPDATED_AT_COLUMN);
    table.dropColumn(CREATED_AT_COLUMN);
  });
};

