const TABLE_NAME = 'knowledge_state_migrations';

/**
 * The marker of a user's migration to knowledge states.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const up = async (knex) => {
  await knex.schema.createTable(TABLE_NAME, (table) => {
    table.integer('userId').references('users.id').primary();
    table.dateTime('migratedAt').notNullable().defaultTo(knex.fn.now());
    table.jsonb('report').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const down = async (knex) => {
  await knex.schema.dropTable(TABLE_NAME);
};

export { down, up };
