const TABLE_NAME = 'target_profile_version';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable(TABLE_NAME, function (table) {
    table.comment('This table is relation table between a target profile and a version');
    table.integer('target_profile_id').unique().references('target-profiles.id').notNullable();
    table.integer('version_id').references('certification_versions.id').notNullable();
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.dropTable(TABLE_NAME);
}
