const TABLE_NAME = 'certification_competence_results';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable(TABLE_NAME, function (table) {
    table.uuid('certificationResultId').references('certification_results.id');
    table.string('competenceId');
    table.integer('level');
    table.unique(['certificationResultId', 'competenceId']);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.dropTable(TABLE_NAME);
}
