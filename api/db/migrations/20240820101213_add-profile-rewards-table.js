// Make sure you properly test your migration, especially DDL (Data Definition Language)
// ! If the target table is large, and the migration take more than 20 minutes, the deployment will fail !

// You can design and test your migration to avoid this by following this guide
// https://1024pix.atlassian.net/wiki/spaces/DEV/pages/2153512965/Cr+er+une+migration

// If your migrations target `answers` or `knowledge-elements`
// contact @team-captains, because automatic migrations are not active on `pix-datawarehouse-production`
// this may prevent data replication to succeed the day after your migration is deployed on `pix-api-production`
import { REWARD_TYPES } from '../../src/quest/domain/constants.js';
export const PROFILE_REWARDS_TABLE_NAME = 'profile-rewards';

const up = async function (knex) {
  await knex.schema.createTable(PROFILE_REWARDS_TABLE_NAME, function (table) {
    table.increments('id').primary();
    table.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    table.bigInteger('userId').index().references('users.id');
    table.enum('rewardType', [REWARD_TYPES.ATTESTATION]).defaultTo(REWARD_TYPES.ATTESTATION);
    table.bigInteger('rewardId').notNullable();
  });
};

const down = async function (knex) {
  return knex.schema.dropTable(PROFILE_REWARDS_TABLE_NAME);
};

export { down, up };
