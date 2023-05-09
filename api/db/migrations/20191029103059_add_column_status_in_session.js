const TABLE_NAME = 'sessions';
const COLUMN_NAME = 'status';

const up = function (knex) {
  return knex.schema.table(TABLE_NAME, async (table) => {
    table.string(COLUMN_NAME).defaultTo('started');
  });
};

const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};

export { up, down };
