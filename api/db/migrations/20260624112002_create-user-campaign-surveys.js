const TABLE_NAME = 'user-campaign-surveys';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable(TABLE_NAME, function (table) {
    table.increments('id').primary();
    table.integer('userId').unsigned().notNullable().references('users.id');
    table.integer('campaignId').unsigned().notNullable().references('campaigns.id');
    table.smallint('satisfactionScore').notNullable().comment('satisfaction score from 1 to 5');
    table.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    table.unique(['userId', 'campaignId']);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTable(TABLE_NAME);
}
