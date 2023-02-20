import buildCampaign from './build-campaign';
import databaseBuffer from '../database-buffer';
import _ from 'lodash';

export default function buildCampaignSkill({ campaignId, skillId = 'recSKI456' } = {}) {
  campaignId = _.isUndefined(campaignId) ? buildCampaign().id : campaignId;

  const values = {
    campaignId,
    skillId,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'campaign_skills',
    values,
  });
}
