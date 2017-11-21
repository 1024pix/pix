const TABLE_NAME = 'certification-challenges';

exports.up = function(knex, Promise) {
  function table(t) {
    t.increments().primary();
    t.string('challengeId');
    t.string('competenceId');
    t.string('associatedSkill');
    t.bigInteger('courseId').unsigned().references('certification-courses.id');
    t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    t.dateTime('updatedAt').notNullable().defaultTo(knex.fn.now());
  }

  return knex.schema
    .createTable(TABLE_NAME, table)
    .then(() => {
      console.log(`${TABLE_NAME} table is created!`);
    });
};

exports.down = function(knex, Promise) {
  return knex.schema
    .dropTable(TABLE_NAME)
    .then(() => {
      console.log(`${TABLE_NAME} table was dropped!`);
    });
};
