const TABLE_NAME = 'assessments';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.string('type');
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.dropColumn('type');
  });
};
