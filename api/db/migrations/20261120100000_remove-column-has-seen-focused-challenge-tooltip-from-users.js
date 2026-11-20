const TABLE_NAME = 'users';
const COLUMN_NAME = 'hasSeenFocusedChallengeTooltip';

// The column is dropped manually and asynchronously in production. This migration keeps a trace
// of the removal and drops the column in environments where it still exists.

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const up = async function (knex) {
  await knex.raw('ALTER TABLE ?? DROP COLUMN IF EXISTS ??', [TABLE_NAME, COLUMN_NAME]);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const down = async function (knex) {
  await knex.raw('ALTER TABLE ?? ADD COLUMN IF NOT EXISTS ?? BOOLEAN DEFAULT false', [TABLE_NAME, COLUMN_NAME]);
};

export { down, up };
