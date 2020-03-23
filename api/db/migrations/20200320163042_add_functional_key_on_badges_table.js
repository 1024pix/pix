const TABLE_NAME = 'badges';
const COLUMN_KEY = 'key';

exports.up = async (knex) => {
  await knex.schema.alterTable(TABLE_NAME, function(table) {
    table.text(COLUMN_KEY);
  });

  return knex.schema.table(TABLE_NAME, (table) => {
    table.unique([COLUMN_KEY]);
  });
};

exports.down = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_KEY);
  });
};
