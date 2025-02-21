const SCHEMA_NAME =
  process.env.NODE_ENV === 'test' ? process.env.TEST_DATAMART_DATABASE_SCHEMA : process.env.DATAMART_DATABASE_SCHEMA;
const up = async function (knex) {
  await knex.schema.withSchema(SCHEMA_NAME).table('data_export_parcoursup_certif_result_code_validation', function (table) {
    table.string('certification_courses_id');
    table.string('national_student_id');
    table.string('organization_uai');
  });
  await knex.schema.withSchema(SCHEMA_NAME).table('data_export_parcoursup_certif_result', function (table) {
    table.string('certification_courses_id');
  });
};

const down = async function (knex) {
  await knex.schema.withSchema(SCHEMA_NAME).table('data_export_parcoursup_certif_result_code_validation', function (table) {
    table.dropColumn('certification_courses_id');
    table.dropColumn('national_student_id');
    table.dropColumn('organization_uai');
  });
  await knex.schema.withSchema(SCHEMA_NAME).table('data_export_parcoursup_certif_result', function (table) {
    table.dropColumn('certification_courses_id');
  });
};

export { down, up };
