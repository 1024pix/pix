const TABLE_NAME = 'certification-issue-reports';

export const up = async (knex) => {
  await knex.schema.createTable(TABLE_NAME, (t) => {
    t.increments('id').primary();
    t.integer('certificationCourseId').references('certification-courses.id').index();
    t.string('category');
    t.string('description', 500);
    t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    t.dateTime('updatedAt').notNullable().defaultTo(knex.fn.now());
  });
};

export const down = function (knex) {
  return knex.schema.dropTable(TABLE_NAME);
};
