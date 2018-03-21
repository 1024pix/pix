const TABLE_NAME = 'sessions';

exports.up = function(knex, Promise) {
  return knex.schema.table(TABLE_NAME, function(table){
      table.string('accessCode');
    });
};

exports.down = function(knex, Promise) {
  return knex.schema.table(TABLE_NAME, function(table){
      table.dropColumn('accessCode');
    });
};
