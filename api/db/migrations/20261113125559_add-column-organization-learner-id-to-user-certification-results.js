const TABLE_NAME = 'user_certification_results';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.integer('organizationLearnerId').nullable().references('organization-learners.id');
    table.index('organizationLearnerId');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn('organizationLearnerId');
  });
}
