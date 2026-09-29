/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.raw(
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS "users_email_index" ON "users" USING GIN ("email" gin_trgm_ops)',
  );
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.raw('DROP INDEX CONCURRENTLY IF EXISTS "users_email_index"');
}

// CREATE INDEX CONCURRENTLY cannot run inside a transaction block
export const config = { transaction: false };
