const TABLE_NAME = 'flash-algorithm-configurations';
const COLUMN_NAME = 'variationPercentUntil';

const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.integer(COLUMN_NAME);
  });
};

const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};

export { up, down };
