const TABLE_NAME = 'users';
const COLUMN_NAME = 'lang';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, async (table) => {
    table.string(COLUMN_NAME).notNullable().defaultTo('fr');
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};
