const TABLE_NAME = 'campaigns';
const COLUMN_NAME = 'type';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.string(COLUMN_NAME).notNullable().defaultTo('');
  }).then(() => {
    return knex(TABLE_NAME)
      .update({
        type: 'TEST_GIVEN'
      });
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};
