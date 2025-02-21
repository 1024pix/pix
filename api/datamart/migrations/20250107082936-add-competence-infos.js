const SCHEMA_NAME =
  process.env.NODE_ENV === 'test' ? process.env.TEST_DATAMART_DATABASE_SCHEMA : process.env.DATAMART_DATABASE_SCHEMA;
const COLUMN_NAMES = ['competence_name', 'competence_code', 'area_name'];

const up = async function (knex) {
  await knex.schema
    .withSchema(SCHEMA_NAME)
    .table('data_export_parcoursup_certif_result_code_validation', function (table) {
      COLUMN_NAMES.forEach((columnName) => table.string(columnName));
      table.dropColumn('competence_id');
    });
  await knex.schema.withSchema(SCHEMA_NAME).table('data_export_parcoursup_certif_result', function (table) {
    COLUMN_NAMES.forEach((columnName) => table.string(columnName));
    table.dropColumn('competence_id');
  });
};

const down = async function (knex) {
  await knex.schema
    .withSchema(SCHEMA_NAME)
    .table('data_export_parcoursup_certif_result_code_validation', function (table) {
      COLUMN_NAMES.forEach((columnName) => table.dropColumn(columnName));
      table.string('competence_id');
    });
  await knex.schema.withSchema(SCHEMA_NAME).table('data_export_parcoursup_certif_result', function (table) {
    COLUMN_NAMES.forEach((columnName) => table.dropColumn(columnName));
    table.string('competence_id');
  });
};

export { down, up };
