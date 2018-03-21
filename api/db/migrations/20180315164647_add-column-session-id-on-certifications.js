const TABLE_NAME = 'certification-courses';

exports.up = function(knex, Promise) {
  return knex.schema.table(TABLE_NAME, function(table){
    table.integer('sessionId').references('session.id').index();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table(TABLE_NAME, function(table){
    table.integer('sessionId').references('session.id').index();
  });
};
