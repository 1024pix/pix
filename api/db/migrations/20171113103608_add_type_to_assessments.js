const TABLE_NAME = 'assessments';

exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table(TABLE_NAME, function(table){
      table.string('type');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table(TABLE_NAME, function(table){
      table.dropColumn('type');
    })
  ]);
};
