const TABLE_NAME = 'stages';
const LEVEL_COLUMN = 'level';
const THRESHOLD_COLUMN = 'threshold';

export const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, (table) => {
    table.integer(LEVEL_COLUMN).nullable().defaultTo(null);
    table.integer(THRESHOLD_COLUMN).nullable().alter();
  });
};

export const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(LEVEL_COLUMN);
  });
};
