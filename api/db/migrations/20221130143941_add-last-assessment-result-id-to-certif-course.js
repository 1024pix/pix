const TABLE_NAME = 'certification-course-last-assessment-result';

exports.up = function (knex) {
  return knex.schema.createTable(TABLE_NAME, function (table) {
    table
      .integer('certificationCourseId')
      .unique({ indexName: 'certification-course-last-assessment-id-unique' })
      .references('certification-courses.id')
      .notNullable();
    table.integer('lastAssessmentResultId').references('assessment-results.id').notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable(TABLE_NAME);
};
