const TABLE_NAME = 'complementary-certification-badges';
const COLUMN_NAME = 'level';

export const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.integer(COLUMN_NAME).notNullable().defaultTo(1);
  });
};

export const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};
