const TABLE_NAME = 'sessions';

exports.up = (knex) => {

  function table(t) {

    t.increments().primary();
    t.text('certificationCenter').notNullable();
    t.text('address').notNullable();
    t.text('room').notNullable();
    t.text('examiner').notNullable();
    t.date('date').notNullable();
    t.time('time').notNullable();
    t.text('description').defaultTo('');
    t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
  }

  return knex.schema
    .createTable(TABLE_NAME, table)
    .then(() => {
      console.log(`${TABLE_NAME} table is created!`);
    });

};

exports.down = (knex) => {

  return knex.schema
    .dropTable(TABLE_NAME)
    .then(() => {
      console.log(`${TABLE_NAME} table was dropped`);
    });
};
