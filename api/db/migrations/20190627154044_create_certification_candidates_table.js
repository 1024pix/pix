const TABLE_NAME = 'certification-candidates';

exports.up = (knex) => {
  return knex.schema
    .createTable(TABLE_NAME, (t) => {
      t.increments().primary();
      t.string('firstName').notNullable();
      t.string('lastName').notNullable();
      t.string('birthCountry');
      t.string('birthProvince');
      t.string('birthCity');
      t.string('externalId');
      t.date('birthdate').notNullable();
      t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
      t.integer('sessionId').references('sessions.id').notNull().index();
      t.float('extraTimePercentage').defaultTo(0);
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
