const TABLE_NAME = 'activities';
const COLUMN_NAME = 'stepIndex';

const up = async function (knex) {
  await knex.schema.alterTable(TABLE_NAME, function (table) {
    table.integer(COLUMN_NAME).defaultTo(null);
  });
};

const down = async function (knex) {
  await knex.schema.alterTable(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};

export { down, up };
