const TABLE_NAME = 'complementary-certification-badges';
const COLUMN_NAME = 'level';

exports.up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.integer(COLUMN_NAME).notNullable().defaultTo(1);
  });
};

exports.down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};
