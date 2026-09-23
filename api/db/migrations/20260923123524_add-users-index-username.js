/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.raw(`CREATE INDEX CONCURRENTLY IF NOT EXISTS "users_username_lower_index" ON "users"(LOWER("username"))`);
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.raw('DROP INDEX CONCURRENTLY IF EXISTS "users_username_lower_index"');
}

export const config = { transaction: false };
