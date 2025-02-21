const SCHEMA_NAME =
  process.env.NODE_ENV === 'test' ? process.env.TEST_DATAMART_DATABASE_SCHEMA : process.env.DATAMART_DATABASE_SCHEMA;
const TABLE_NAME = 'data_export_parcoursup_certif_result';

const up = async function (knex) {
  await knex.schema.withSchema(SCHEMA_NAME).createTable(TABLE_NAME, function (table) {
    table.string('national_student_id');
    table.index('national_student_id');
  });
};

const down = async function (knex) {
  await knex.schema.withSchema(SCHEMA_NAME).dropTable(TABLE_NAME);
};

export { down, up };
