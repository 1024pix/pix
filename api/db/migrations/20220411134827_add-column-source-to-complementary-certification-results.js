const TABLE_NAME = 'complementary-certification-course-results';
const COLUMN_NAME = 'source';

const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.string(COLUMN_NAME).defaultTo('PIX').notNullable();
  });

  await knex.raw(`
    ALTER TABLE "complementary-certification-course-results" ADD CONSTRAINT "complementary-certification-course-results_source_check"
      CHECK ( "source" IN ( 'PIX', 'EXTERNAL'))
  `);
};

const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};

export { up, down };
