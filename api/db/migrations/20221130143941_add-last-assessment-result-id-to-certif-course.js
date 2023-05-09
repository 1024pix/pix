const TABLE_NAME = 'certification-courses-last-assessment-results';

const up = function(knex) {
  return knex.schema.createTable(TABLE_NAME, function (table) {
    table
      .integer('certificationCourseId')
      .unique({ indexName: 'certification-course-last-assessment-id-unique' })
      .references('certification-courses.id')
      .notNullable();
    table.integer('lastAssessmentResultId').references('assessment-results.id').notNullable();
  });
};

const down = function(knex) {
  return knex.schema.dropTable(TABLE_NAME);
};

export { up, down };
