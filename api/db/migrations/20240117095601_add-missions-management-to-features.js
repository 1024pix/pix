// Make sure you properly test your migration, especially DDL (Data Definition Language)
// ! If the target table is large, and the migration take more than 20 minutes, the deployment will fail !

// You can design and test your migration to avoid this by following this guide
// https://1024pix.atlassian.net/wiki/spaces/DEV/pages/2153512965/Cr+er+une+migration

// If your migrations target `answers` or `knowledge-elements`
// contact @team-captains, because automatic migrations are not active on `pix-datawarehouse-production`
// this may prevent data replication to succeed the day after your migration is deployed on `pix-api-production`
import { ORGANIZATION_FEATURE } from '../../lib/domain/constants.js';

const up = async function (knex) {
  await knex('features').insert({
    key: ORGANIZATION_FEATURE.MISSIONS_MANAGEMENT.key,
    description: ORGANIZATION_FEATURE.MISSIONS_MANAGEMENT.description,
  });
};

const down = async function (knex) {
  await knex('features').where({ key: ORGANIZATION_FEATURE.MISSIONS_MANAGEMENT.key }).delete();
};

export { up, down };
