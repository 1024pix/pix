const CERTIFICATION_RESULTS_TABLE = 'certification_results';
const USER_CERTIFICATION_RESULTS_TABLE = 'user_certification_results';
const CERTIFICATION_COMPETENCE_RESULTS_TABLE = 'certification_competence_results';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  for (const tableName of [CERTIFICATION_RESULTS_TABLE, USER_CERTIFICATION_RESULTS_TABLE]) {
    await knex.schema.table(tableName, function (table) {
      table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(knex.fn.now());
      table.timestamp('updatedAt', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    });
  }
  await knex.schema.table(CERTIFICATION_COMPETENCE_RESULTS_TABLE, function (table) {
    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  for (const tableName of [CERTIFICATION_RESULTS_TABLE, USER_CERTIFICATION_RESULTS_TABLE]) {
    await knex.schema.table(tableName, function (table) {
      table.dropColumn('createdAt');
      table.dropColumn('updatedAt');
    });
  }
  await knex.schema.table(CERTIFICATION_COMPETENCE_RESULTS_TABLE, function (table) {
    table.dropColumn('createdAt');
  });
}
