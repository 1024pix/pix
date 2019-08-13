const TABLE_NAME = 'students';

exports.up = function(knex) {
  return knex.schema
    .createTable(TABLE_NAME, (t) => {
      t.increments().primary();
      t.integer('userId').unsigned().references('users.id').index();
      t.integer('organizationId').unsigned().references('organizations.id').index();
      t.string('firstName').notNullable();
      t.string('lastName').notNullable();
      t.date('birthdate').notNullable();
      t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
      t.dateTime('updatedAt').notNullable().defaultTo(knex.fn.now());
    })
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
