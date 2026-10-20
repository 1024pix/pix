const TABLE_NAME = 'fct_structures';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.unique('organization_id');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropUnique('organization_id');
  });
}
