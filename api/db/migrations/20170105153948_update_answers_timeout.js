
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('answers', function(table){
      table.integer('timeout');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('answers', function(table){
      table.dropColumn('timeout');
    })
  ]);
};
