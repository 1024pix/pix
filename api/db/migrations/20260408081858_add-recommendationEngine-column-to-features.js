import { CAMPAIGN_FEATURES } from '../../src/shared/constants.js';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const up = async function (knex) {
  await knex('features').insert({
    key: CAMPAIGN_FEATURES.RECOMMENDATION_ENGINE,
    description: "Permet d'indiquer si la campagne est concernée par le moteur de recommandations",
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const down = async function (knex) {
  await knex('features').where({ key: CAMPAIGN_FEATURES.RECOMMENDATION_ENGINE.key }).delete();
};

export { down, up };
