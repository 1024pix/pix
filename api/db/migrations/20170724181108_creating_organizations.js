exports.up = function(knex) {

  function table(table) {
    table.increments().primary();
    table.string('email').notNullable();
    table.enu('type', ['SCO', 'SUP', 'PRO']).notNullable();
    table.string('name').notNullable();
    table.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    table.dateTime('updatedAt').notNullable().defaultTo(knex.fn.now());
    table.bigInteger('userId').index().references('users.id');
  }

  return knex.schema
    .createTable('organizations', table)
    .then(() => {
      console.log('organizations table is created!');
    });};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('organizations')
  ]);
};
