const TABLE_NAME = 'certification-courses';

exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table(TABLE_NAME, function(table){
      table.integer('userId').references('users.id').index();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table(TABLE_NAME, function(table){
      table.dropColumn('userId');
    })
  ]);
};
