const TABLE_NAME = 'answers';

exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table(TABLE_NAME, function(table){
      table.integer('elapsedTime');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table(TABLE_NAME, function(table){
      table.dropColumn('elapsedTime');
    })
  ]);
};
