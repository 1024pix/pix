import { ORGANIZATION_FEATURE } from '../../src/shared/constants.js';

const up = async function (knex) {
  await knex('features').insert({
    key: ORGANIZATION_FEATURE.COVER_RATE.key,
    description: ORGANIZATION_FEATURE.COVER_RATE.description,
  });
};

const down = async function (knex) {
  await knex('features').where({ key: ORGANIZATION_FEATURE.COVER_RATE.key }).delete();
};

export { down, up };
