const TABLE_NAME = 'certification-challenges';

export const up = function (knex) {
  function table(t) {
    t.increments().primary();
    t.string('challengeId');
    t.string('competenceId');
    t.string('associatedSkill');
    t.bigInteger('courseId').unsigned().references('certification-courses.id');
    t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    t.dateTime('updatedAt').notNullable().defaultTo(knex.fn.now());
  }

  return knex.schema.createTable(TABLE_NAME, table);
};

export const down = function (knex) {
  return knex.schema.dropTable(TABLE_NAME);
};
