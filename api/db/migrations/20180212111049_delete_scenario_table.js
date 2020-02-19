const TABLE_NAME = 'scenarios';

exports.up = function(knex) {

  return knex.schema
    .dropTable(TABLE_NAME);
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
    .createTable(TABLE_NAME, table);

};
