const TABLE_NAME = 'badge-criteria';
const COLUMN_NAME = 'cappedTubes';

const up = function(knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.jsonb(COLUMN_NAME);
  });
};

const down = function(knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};

export { up, down };
