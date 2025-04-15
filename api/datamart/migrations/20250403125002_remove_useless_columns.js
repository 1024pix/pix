/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const up = async function (knex) {
  await knex.schema.alterTable('data_export_parcoursup_certif_result_code_validation', function (table) {
    table.dropColumn('national_student_id');
    table.dropColumn('organization_uai');
  });

  await knex.schema.alterTable('certification_results', function (table) {
    table.dropColumn('national_student_id');
    table.dropColumn('organization_uai');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const down = async function (knex) {
  await knex.schema.alterTable('data_export_parcoursup_certif_result_code_validation', function (table) {
    table.string('national_student_id');
  });

  await knex.schema.alterTable('certification_results', function (table) {
    table.string('national_student_id');
  });
};

export { down, up };
