const TABLE_NAME = 'flash-assessment-results';

export const up = function (knex) {
  return knex.schema.createTable(TABLE_NAME, (t) => {
    t.increments().primary();
    t.integer('assessmentId').references('assessments.id').notNullable().unique();
    t.double('estimatedLevel').notNullable();
    t.double('errorRate').notNullable();
  });
};

export const down = function (knex) {
  return knex.schema.dropTable(TABLE_NAME);
};
