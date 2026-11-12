const TABLE_NAME = 'lti_campaign_participations';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable(TABLE_NAME, function (table) {
    table.increments();
    table.string('platformUserSub').notNullable();
    table.text('lineItemContainerUrl').notNullable();
    table.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    table.string('clientId').references('clientId').inTable('lti_platform_registrations').notNullable();
    table.integer('campaignId').references('id').inTable('campaigns').notNullable();
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.dropTable(TABLE_NAME);
}
