const TABLE_NAME = 'certification-courses';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.integer('sessionId').references('sessions.id').index();
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.integer('sessionId').references('sessions.id').index();
  });
};
