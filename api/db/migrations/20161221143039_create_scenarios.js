const TABLE_NAME = 'scenarios';

export const up = function (knex) {
  function table(t) {
    t.increments().primary();
    t.string('courseId').notNull();
    t.string('path').notNull();
    t.string('nextChallengeId').notNull();
    t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    t.dateTime('updatedAt').notNullable().defaultTo(knex.fn.now());
  }

  return knex.schema.createTable(TABLE_NAME, table);
};

export const down = function (knex) {
  return knex.schema.dropTable(TABLE_NAME);
};
