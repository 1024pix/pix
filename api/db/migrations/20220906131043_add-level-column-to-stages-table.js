const TABLE_NAME = 'stages';
const LEVEL_COLUMN = 'level';
const THRESHOLD_COLUMN = 'threshold';

exports.up = async function (knex) {
  await knex.schema.table(TABLE_NAME, async (table) => {
    table.integer(LEVEL_COLUMN).nullable().defaultTo(null);
  });
  return knex.schema.alterTable(TABLE_NAME, function (table) {
    table.integer(THRESHOLD_COLUMN).nullable().alter();
  });
};

exports.down = async function (knex) {
  await knex.schema.table(TABLE_NAME, async (table) => {
    table.dropColumn(LEVEL_COLUMN);
  });
};
