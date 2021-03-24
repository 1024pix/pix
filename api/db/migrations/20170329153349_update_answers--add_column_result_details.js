const TABLE_NAME = 'answers';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.text('resultDetails');
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('resultDetails');
  });
};
