const TABLE_NAME = 'combined_course_blueprints';
const REWARD_ID = 'rewardId';
const REWARD_TYPE = 'rewardType';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table
      .integer(REWARD_ID)
      .defaultTo(null)
      .references('attestations.rewardId')
      .comment('Links a reward id to a blueprint');
    table
      .integer(REWARD_TYPE)
      .defaultTo(null)
      .comment('Links a reward type to a combined course blueprint - value is always attestation');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(REWARD_ID);
  });
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(REWARD_TYPE);
  });
};

export { down, up };
