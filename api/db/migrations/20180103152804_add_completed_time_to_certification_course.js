const TABLE_NAME = 'certification-courses';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.dateTime('completedAt');
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.dropColumn('completedAt');
  });
};
