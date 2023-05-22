const TABLE_NAME = 'flash-assessment-results';

const up = function (knex) {
  return knex.schema.createTable(TABLE_NAME, (t) => {
    t.increments().primary();
    t.integer('assessmentId').references('assessments.id').notNullable().unique();
    t.double('estimatedLevel').notNullable();
    t.double('errorRate').notNullable();
  });
};

const down = function (knex) {
  return knex.schema.dropTable(TABLE_NAME);
};

export { up, down };
