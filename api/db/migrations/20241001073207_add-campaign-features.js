import { CAMPAIGN_FEATURES } from '../../src/shared/domain/constants.js';

const TABLE_NAME = 'campaign-features';

const up = async function (knex) {
  await knex.schema.createTable(TABLE_NAME, function (table) {
    table.increments('id').primary();
    table.integer('featureId').notNullable().unsigned().references('id').inTable('features');
    table.integer('campaignId').notNullable().unsigned().references('id').inTable('campaigns');
    table.jsonb('params').defaultTo(null);
  });
  return knex('features').insert(CAMPAIGN_FEATURES.EXTERNAL_ID);
};

const down = async function (knex) {
  await knex.schema.dropTable(TABLE_NAME);
  return knex('features').where({ key: CAMPAIGN_FEATURES.EXTERNAL_ID.key }).delete();
};

export { down, up };
