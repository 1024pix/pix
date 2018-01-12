const TABLE_NAME = 'certification-courses';

exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table(TABLE_NAME, function(table) {
      table.dateTime('completedAt');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table(TABLE_NAME, function(table) {
      table.dropColumn('completedAt');
    })
  ]);
};
