import { CAMPAIGN_FEATURES } from '../../src/shared/constants.js';

const OLD_KEY = JSON.stringify(CAMPAIGN_FEATURES.RECOMMENDATION_ENGINE);
const OLD_DESCRIPTION = "Permet d'indiquer si la campagne est concernée par le moteur de recommandations";

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const up = async function (knex) {
  await knex('features').where({ key: OLD_KEY }).update({
    key: CAMPAIGN_FEATURES.RECOMMENDATION_ENGINE.key,
    description: CAMPAIGN_FEATURES.RECOMMENDATION_ENGINE.description,
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const down = async function (knex) {
  await knex('features').where({ key: CAMPAIGN_FEATURES.RECOMMENDATION_ENGINE.key }).update({
    key: OLD_KEY,
    description: OLD_DESCRIPTION,
  });
};

export { down, up };
