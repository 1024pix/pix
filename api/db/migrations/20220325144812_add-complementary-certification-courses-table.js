const COMPLEMENTARY_CERTIFICATION_COURSES_TABLE_NAME = 'complementary-certification-courses';

const up = function(knex) {
  return knex.schema.table(COMPLEMENTARY_CERTIFICATION_COURSES_TABLE_NAME, async (table) => {
    table.increments('id').primary();
  });
};

const down = function(knex) {
  return knex.schema.table(COMPLEMENTARY_CERTIFICATION_COURSES_TABLE_NAME, async (table) => {
    table.dropColumn('id');
  });
};

export { up, down };
