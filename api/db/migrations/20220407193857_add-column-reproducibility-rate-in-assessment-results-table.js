const TABLE_NAME = 'assessment-results';
const COLUMN_NAME = 'reproducibilityRate';

const up = function(knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.decimal(COLUMN_NAME, 5, 2).defaultTo(null);
  });
};

const down = function(knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};

export { up, down };
