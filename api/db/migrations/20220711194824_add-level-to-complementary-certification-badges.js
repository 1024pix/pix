const TABLE_NAME = 'complementary-certification-badges';
const COLUMN_NAME = 'level';

const up = async function(knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.integer(COLUMN_NAME).notNullable().defaultTo(1);
  });
};

const down = async function(knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};

export { up, down };
