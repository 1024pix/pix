const TABLE_NAME = 'users';

exports.up = function(knex, Promise) {

  return Promise.all([
    knex.schema.table(TABLE_NAME, function (table) {
      table.dropColumn('login');
      table.boolean('cgu');
    })
  ]);

};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table(TABLE_NAME, function (table) {
      table.string('login').defaultTo("").notNullable();
      table.dropColumn('cgu');
    })
  ]);
};
