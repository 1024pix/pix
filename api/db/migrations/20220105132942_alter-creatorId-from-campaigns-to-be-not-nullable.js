const TABLE_NAME = 'campaigns';
const COLUMN_NAME = 'creatorId';

exports.up = function (knex) {
  return knex.schema.alterTable(TABLE_NAME, (table) => {
    table.integer(COLUMN_NAME).notNullable().alter();
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable(TABLE_NAME, (table) => {
    table.integer(COLUMN_NAME).nullable().alter();
  });
};
