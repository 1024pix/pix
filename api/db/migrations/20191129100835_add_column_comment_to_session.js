const TABLE_NAME = 'sessions';
const COLUMN_NAME = 'examinerComment';

const up = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.string(COLUMN_NAME, 500);
  });
};

const down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};

export { up, down };
