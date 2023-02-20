const TABLE_NAME = 'badge-criteria';
const COLUMN_NAME = 'cappedTubes';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.jsonb(COLUMN_NAME);
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};
