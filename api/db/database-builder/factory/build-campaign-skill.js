import { buildCampaign } from './build-campaign.js';
import { databaseBuffer } from '../database-buffer.js';
import _ from 'lodash';

const buildCampaignSkill = function ({ campaignId, skillId = 'recSKI456' } = {}) {
  campaignId = _.isUndefined(campaignId) ? buildCampaign().id : campaignId;

  const values = {
    campaignId,
    skillId,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'campaign_skills',
    values,
  });
};

export { buildCampaignSkill };
