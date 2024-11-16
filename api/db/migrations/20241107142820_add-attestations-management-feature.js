import { ORGANIZATION_FEATURE } from '../../src/shared/domain/constants.js';

const up = async function (knex) {
  await knex('features').insert({
    key: ORGANIZATION_FEATURE.ATTESTATIONS_MANAGEMENT.key,
    description: ORGANIZATION_FEATURE.ATTESTATIONS_MANAGEMENT.description,
  });
};

const down = async function (knex) {
  await knex('features').where({ key: ORGANIZATION_FEATURE.ATTESTATIONS_MANAGEMENT.key }).delete();
};

export { down, up };
