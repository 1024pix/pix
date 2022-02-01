const TABLE_NAME = 'certification-centers';
const UPDATED_AT_COLUMN = 'updatedAt';

exports.up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dateTime(UPDATED_AT_COLUMN).notNullable().defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(UPDATED_AT_COLUMN);
  });
};
