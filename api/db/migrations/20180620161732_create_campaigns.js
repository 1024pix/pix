const TABLE_NAME = 'campaigns';

exports.up = (knex) => {
  return knex.schema
    .createTable(TABLE_NAME, (t) => {
      t.increments().primary();
      t.string('name').notNullable();
      t.string('code').default('').notNullable().index();
      t.integer('organizationId').unsigned().references('organizations.id').index();
      t.integer('creatorId').unsigned().references('users.id');
      t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    })
    .then(() => {
      console.log(`${TABLE_NAME} table is created!`);
    });
};

exports.down = (knex) => {
  return knex.schema
    .dropTable(TABLE_NAME)
    .then(() => {
      console.log(`${TABLE_NAME} table was dropped!`);
    });
};
