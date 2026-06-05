const TABLE_NAME = 'profile-rewards';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.bigInteger('userId').comment('The id of the user.').notNullable().alter();
    table
      .string('rewardType')
      .comment('The table linked to the reward. The attestation table is one of the possible values.')
      .notNullable()
      .alter();
    table
      .bigInteger('rewardId')
      .comment(
        'The id of the reward linked to the user. For example, if the rewardType is “attestation”, the rewardId will be the id column of the attestation table.',
      )
      .notNullable()
      .alter();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.bigInteger('userId').comment('The id of the user.').nullable().alter();
    table
      .string('rewardType')
      .comment('The table linked to the reward. The attestation table is one of the possible values.')
      .nullable()
      .alter();
    table
      .bigInteger('rewardId')
      .comment(
        'The id of the reward linked to the user. For example, if the rewardType is “attestation”, the rewardId will be the id column of the attestation table.',
      )
      .nullable()
      .alter();
  });
};

export { down, up };
