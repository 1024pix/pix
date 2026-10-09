const TABLE_NAME = 'lti_platforms';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable(TABLE_NAME, (table) => {
    table.increments('id').primary();
    table.string('origin').notNullable().comment("Url d'origine de la plateforme");
    table.timestamps(false, true, true);
    table.comment('Plateformes LTI authorisées');
  });

  await knex('lti_platform_registrations').truncate();
  await knex.schema.alterTable('lti_platform_registrations', (table) => {
    table.integer('platformId').notNullable().references(`${TABLE_NAME}.id`);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable('lti_platform_registrations', (table) => {
    table.dropColumn('platformId');
  });

  await knex.schema.dropTable(TABLE_NAME);
}
