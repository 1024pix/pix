const TABLE_NAME = 'complementary-certification-courses';

export const up = (knex) => {
  return knex.schema.createTable(TABLE_NAME, (t) => {
    t.integer('complementaryCertificationId').references('complementary-certifications.id').notNullable();
    t.integer('certificationCourseId').references('certification-courses.id').notNullable();
    t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
  });
};

export const down = (knex) => {
  return knex.schema.dropTable(TABLE_NAME);
};
