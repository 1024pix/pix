const SCHEMA_NAME =
  process.env.NODE_ENV === 'test' ? process.env.TEST_DATAMART_DATABASE_SCHEMA : process.env.DATAMART_DATABASE_SCHEMA;
const TABLE_NAME = 'data_export_parcoursup_certif_result';

const up = async function (knex) {
  await knex.schema.withSchema(SCHEMA_NAME).table(TABLE_NAME, function (table) {
    table.string('organization_uai');
    table.string('last_name');
    table.string('first_name');
    table.date('birthdate');
    table.text('status');
    table.integer('pix_score');
    table.timestamp('certification_date');
    table.string('competence_id');
    table.integer('competence_level');
    table.index('organization_uai');
  });
};

const down = async function (knex) {
  await knex.schema.withSchema(SCHEMA_NAME).table(TABLE_NAME, function (table) {
    table.dropColumn('organization_uai');
    table.dropColumn('last_name');
    table.dropColumn('first_name');
    table.dropColumn('birthdate');
    table.dropColumn('status');
    table.dropColumn('pix_score');
    table.dropColumn('competence_id');
    table.dropColumn('competence_level');
    table.dropColumn('certification_date');
  });
};

export { down, up };
