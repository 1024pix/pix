const TABLE_NAME = 'credits_consumptions';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable(TABLE_NAME, function (table) {
    table.comment('This table contains the consumption of credits associated by an organization learner.');
    table.increments('id').primary();
    table.integer('credit_lot_id').notNullable().references('credits_lots.id');
    table.integer('organization_learner_id').notNullable().references('organization-learners.id');
    table.dateTime('consumed_at').notNullable();
    table.unique(['credit_lot_id', 'organization_learner_id']);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTable(TABLE_NAME);
}
