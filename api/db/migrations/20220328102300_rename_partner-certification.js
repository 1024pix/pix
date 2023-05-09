const OLD_TABLE_NAME = 'partner-certifications';
const COMPLEMENTARY_CERTIFICATION_COURSE_RESULTS_TABLE = 'complementary-certification-course-results';

const up = async function(knex) {
  await knex.schema.renameTable(OLD_TABLE_NAME, COMPLEMENTARY_CERTIFICATION_COURSE_RESULTS_TABLE);
};

const down = async function(knex) {
  await knex.schema.renameTable(COMPLEMENTARY_CERTIFICATION_COURSE_RESULTS_TABLE, OLD_TABLE_NAME);
};

export { up, down };
