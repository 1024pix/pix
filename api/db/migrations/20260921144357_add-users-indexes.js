/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // indexes used for queries on exact matching
  await knex.raw(
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS "users_firstname_lower_index" ON "users"(LOWER("firstName"))`,
  );
  await knex.raw(`CREATE INDEX CONCURRENTLY IF NOT EXISTS "users_lastname_lower_index" ON "users"(LOWER("lastName"))`);

  // indexes used for queries on partial matching (ie using "LIKE" or "ILIKE" operator)
  await knex.raw(
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS "users_firstname_index" ON "users" USING GIN ("firstName" gin_trgm_ops)`,
  );
  await knex.raw(
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS "users_lastname_index" ON "users" USING GIN ("lastName" gin_trgm_ops)`,
  );
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.raw('DROP INDEX CONCURRENTLY IF EXISTS "users_firstname_lower_index"');
  await knex.raw('DROP INDEX CONCURRENTLY IF EXISTS "users_lastname_lower_index"');
  await knex.raw('DROP INDEX CONCURRENTLY IF EXISTS "users_firstname_index"');
  await knex.raw('DROP INDEX CONCURRENTLY IF EXISTS "users_lastname_index"');
}

// CREATE INDEX CONCURRENTLY cannot run inside a transaction block
export const config = { transaction: false };
