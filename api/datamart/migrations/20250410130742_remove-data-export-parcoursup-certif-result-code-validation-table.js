const TABLE_NAME = 'data_export_parcoursup_certif_result_code_validation';

/**
 * @param { import('knex').Knex } knex
 * @returns { Promise<void> }
 */
const up = async function (knex) {
  await knex.schema.dropTable(TABLE_NAME);
};

/**
 * @param { import('knex').Knex } knex
 * @returns { Promise<void> }
 */
const down = async function () {
  // No use of table recreation as it is not used anymore
};

export { down, up };
