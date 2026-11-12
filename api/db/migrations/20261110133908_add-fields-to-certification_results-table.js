/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.table('certification_results', function (table) {
    table.text('nationalStudentId').defaultTo(null);
    table.text('birthPostalCode').defaultTo(null);
    table.text('birthINSEECode').defaultTo(null);
    table.text('birthCountry').defaultTo(null);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.table('certification_results', function (table) {
    table.dropColumn('nationalStudentId');
    table.dropColumn('birthPostalCode');
    table.dropColumn('birthINSEECode');
    table.dropColumn('birthCountry');
  });
}
