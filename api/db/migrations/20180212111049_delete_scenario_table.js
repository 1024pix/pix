const TABLE_NAME = 'scenarios';

exports.up = function(knex) {

  return knex.schema
    .dropTable(TABLE_NAME)
    .then(() => {
      console.log(`${TABLE_NAME} table was dropped!`);
    });
};

exports.down = function(knex) {

  function table(t) {

    t.increments().primary();
    t.string('courseId').notNull();
    t.string('path').notNull();
    t.string('nextChallengeId').notNull();
    t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    t.dateTime('updatedAt').notNullable().defaultTo(knex.fn.now());
  }

  return knex.schema
    .createTable(TABLE_NAME, table)
    .then(() => {
      console.log(`${TABLE_NAME} table is created!`);
    });

};
