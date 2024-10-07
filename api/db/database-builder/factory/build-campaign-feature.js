import { databaseBuffer } from '../database-buffer.js';

const buildCampaignFeature = function buildCampaignFeature({
  id = databaseBuffer.getNextId(),
  campaignId,
  featureId,
  params,
} = {}) {
  const values = {
    id,
    campaignId,
    featureId,
    params,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'campaign-features',
    values,
  });
};

export { buildCampaignFeature };
