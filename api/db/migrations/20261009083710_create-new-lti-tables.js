/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable('lti_platforms', (table) => {
    table.increments('id').primary();
    table.string('origin').notNullable().comment("URL d'origine de la plateforme");
    table.timestamps(false, true, true);
    table.comment('Plateformes LTI autorisées');
  });

  await knex('lti_platform_registrations').truncate();
  await knex.schema.alterTable('lti_platform_registrations', (table) => {
    table.integer('platformId').notNullable().references('lti_platforms.id');
    table.dropColumn('platformOrigin');
  });

  await knex.schema.createTable('lti_platform_organizations', (table) => {
    table.integer('platformId').notNullable().references('lti_platforms.id');
    table.integer('organizationId').notNullable().references('organizations.id');
    table.primary(['platformId', 'organizationId']);
    table.comment('Organisations accessibles via les plateformes LTI');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTable('lti_platform_organizations');

  await knex('lti_platform_registrations').truncate();
  await knex.schema.alterTable('lti_platform_registrations', (table) => {
    table.dropColumn('platformId');
    table.string('platformOrigin').notNullable().comment("URL d'origine de la plateforme");
  });

  await knex.schema.dropTable('lti_platforms');
}
