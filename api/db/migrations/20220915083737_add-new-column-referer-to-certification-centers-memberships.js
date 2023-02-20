const TABLE_NAME = 'certification-center-memberships';
const COLUMN_NAME = 'isReferer';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.boolean(COLUMN_NAME).defaultTo(false);
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};
