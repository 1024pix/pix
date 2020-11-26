const TABLE_NAME = 'certification-issue-reports';

exports.up = async (knex) => {
  await knex.schema.createTable(TABLE_NAME, (t) => {
    t.increments('id').primary();
    t.integer('certificationCourseId').references('certification-courses.id').index();
    t.integer('categoryId');
    t.string('description', 500);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable(TABLE_NAME);
};
