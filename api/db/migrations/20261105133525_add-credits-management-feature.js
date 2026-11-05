import { ORGANIZATION_FEATURE } from '../../src/shared/constants.js';

const TABLE_NAME = 'features';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex(TABLE_NAME).insert(ORGANIZATION_FEATURE.CREDITS_MANAGEMENT);
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex(TABLE_NAME).where('key', ORGANIZATION_FEATURE.CREDITS_MANAGEMENT.key).delete();
}
