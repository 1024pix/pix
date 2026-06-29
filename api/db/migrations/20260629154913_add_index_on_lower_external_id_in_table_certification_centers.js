const TABLE_NAME = 'certification-centers';
const COLUMN_NAME = 'externalId';
const INDEX_NAME = 'certificationcenters_lower_externalid_index';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // eslint-disable-next-line knex/avoid-injections
  await knex.raw(`
    CREATE INDEX IF NOT EXISTS "${INDEX_NAME}"
    ON "${TABLE_NAME}" (LOWER("${COLUMN_NAME}"))
  `);
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  // eslint-disable-next-line knex/avoid-injections
  await knex.raw(`
    DROP INDEX IF EXISTS "${INDEX_NAME}";
  `);
}
