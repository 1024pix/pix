const TABLE_NAME = 'assessments';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.integer('estimatedLevel');
    table.integer('pixScore');
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.dropColumn('estimatedLevel');
    table.dropColumn('pixScore');
  });
};
