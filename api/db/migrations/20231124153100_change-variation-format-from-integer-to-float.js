const TABLE_NAME = 'flash-algorithm-configurations';
const COLUMN_NAME = 'variationPercent';

const up = async function (knex) {
  await knex.schema.alterTable(TABLE_NAME, function (table) {
    table.float(COLUMN_NAME).alter();
  });
};

const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.integer(COLUMN_NAME).alter();
  });
};

export { up, down };
