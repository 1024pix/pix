const TABLE_NAME = 'snapshots';

exports.up = function(knex) {

  function table(t) {
    t.increments().primary();
    t.string('organizationId').unsigned().references('organizations.id');
    t.string('score');
    t.json('profile').notNullable();
    t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    t.dateTime('updatedAt').notNullable().defaultTo(knex.fn.now());
  }

  return knex.schema
    .createTable(TABLE_NAME, table)
    .then(() => {
      console.log(`${TABLE_NAME} table is created!`);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTable(TABLE_NAME)
    .then(() => {
      console.log(`${TABLE_NAME} table was dropped!`);
    });
};
