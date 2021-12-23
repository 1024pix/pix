const TABLE_NAME = 'flash-assessment-results';

exports.up = function (knex) {
  return knex.schema.createTable(TABLE_NAME, (t) => {
    t.increments().primary();
    t.integer('assessmentId').references('assessments.id').notNullable().unique();
    t.double('estimatedLevel').notNullable();
    t.double('errorRate').notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable(TABLE_NAME);
};
