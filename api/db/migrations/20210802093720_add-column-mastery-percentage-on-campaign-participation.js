const TABLE_NAME = 'campaign-participations';
const COLUMN_NAME = 'masteryPercentage';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.decimal(COLUMN_NAME, 3, 2).defaultTo(null);
  });
};

export const down = function (knex) {
  return knex.schema.alterTable(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};
