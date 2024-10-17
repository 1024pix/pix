import { CampaignExternalIdTypes } from '../../src/prescription/shared/domain/constants.js';
import { CAMPAIGN_FEATURES } from '../../src/shared/domain/constants.js';

const TABLE_NAME = 'campaign-features';

const up = async function (knex) {
  const externalFeature = await knex('features').select('id').where({ key: CAMPAIGN_FEATURES.EXTERNAL_ID.key }).first();
  const idPixLabels = await knex('campaigns').select('id', 'idPixLabel').whereNotNull('idPixLabel');
  const dataToInsert = idPixLabels.map(({ id: campaignId, idPixLabel }) => ({
    campaignId,
    featureId: externalFeature.id,
    params: { label: idPixLabel, type: CampaignExternalIdTypes.STRING },
  }));

  return knex.batchInsert(TABLE_NAME, dataToInsert, 1000);
};

const down = async function (knex) {
  const { id: featureId } = await knex('features').where({ key: CAMPAIGN_FEATURES.EXTERNAL_ID.key }).first();

  const results = await knex(TABLE_NAME).select('campaignId', 'params').where({ featureId });
  for (const result of results) {
    await knex('campaigns').update({ idPixLabel: result.params.label }).where({ id: result.campaignId });
  }
  return knex('campaign-features').where({ featureId }).delete();
};

export { down, up };
