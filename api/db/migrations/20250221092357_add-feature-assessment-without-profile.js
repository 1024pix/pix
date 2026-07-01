import { ORGANIZATION_FEATURE } from '../../src/shared/constants.js';

const up = async function (knex) {
  await knex('features').insert({
    key: ORGANIZATION_FEATURE.CAMPAIGN_WITHOUT_USER_PROFILE.key,
    description: ORGANIZATION_FEATURE.CAMPAIGN_WITHOUT_USER_PROFILE.description,
  });
};

const down = async function (knex) {
  await knex('features').where({ key: ORGANIZATION_FEATURE.CAMPAIGN_WITHOUT_USER_PROFILE.key }).delete();
};

export { down, up };
