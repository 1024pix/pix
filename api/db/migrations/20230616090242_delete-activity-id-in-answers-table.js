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
// eslint-disable-next-line no-empty-function
const down = async function () {};

export { down, up };
