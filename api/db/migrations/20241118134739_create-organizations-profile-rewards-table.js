const ORGANIZATIONS_PROFILE_REWARDS_TABLE_NAME = 'organizations-profile-rewards';
const ORGANIZATION_ID_COLUMN = 'organizationId';
const PROFILE_REWARD_ID_COLUMN = 'profileRewardId';
const CONSTRAINT_NAME = 'organizationId_profileRewardId_unique';

const up = async function (knex) {
  await knex.schema.createTable(ORGANIZATIONS_PROFILE_REWARDS_TABLE_NAME, function (table) {
    table.increments().primary().notNullable();
    table.integer(ORGANIZATION_ID_COLUMN).notNullable().unsigned().references('organizations.id').index();
    table.integer(PROFILE_REWARD_ID_COLUMN).notNullable().unsigned().references('profile-rewards.id').index();
    table.unique([ORGANIZATION_ID_COLUMN, PROFILE_REWARD_ID_COLUMN], { indexName: CONSTRAINT_NAME });
  });
};

const down = async function (knex) {
  return knex.schema.dropTable(ORGANIZATIONS_PROFILE_REWARDS_TABLE_NAME);
};

export { down, up };
