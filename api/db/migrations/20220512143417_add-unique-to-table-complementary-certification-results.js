const TABLE_NAME = 'complementary-certification-course-results';
const CONSTRAINT_NAME = 'complementary-certification-course-results-cccrId-source-unique';

const up = async function(knex) {
  return knex.schema.alterTable(TABLE_NAME, (table) => {
    table.unique(['complementaryCertificationCourseId', 'source'], CONSTRAINT_NAME);
  });
};

const down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropUnique(['complementaryCertificationCourseId', 'source'], CONSTRAINT_NAME);
  });
};

export { up, down };
