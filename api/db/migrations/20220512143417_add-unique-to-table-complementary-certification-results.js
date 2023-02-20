const TABLE_NAME = 'complementary-certification-course-results';
const CONSTRAINT_NAME = 'complementary-certification-course-results-cccrId-source-unique';

export const up = async (knex) => {
  return knex.schema.alterTable(TABLE_NAME, (table) => {
    table.unique(['complementaryCertificationCourseId', 'source'], CONSTRAINT_NAME);
  });
};

export const down = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropUnique(['complementaryCertificationCourseId', 'source'], CONSTRAINT_NAME);
  });
};
