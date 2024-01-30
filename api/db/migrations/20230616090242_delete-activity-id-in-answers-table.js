/**
 * @param { import('knex').Knex } knex
 * @returns { Promise<void> }
 */
const up = function (knex) {
  return knex.raw('ALTER TABLE "answers" DROP COLUMN IF EXISTS "activityId"');
};

/**
 * @param { import('knex').Knex } knex
 * @returns { Promise<void> }
 */
// biome-ignore lint: no empty block
const down = async function () {};

export { up, down };
