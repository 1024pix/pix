const buildCampaign = require('./build-campaign');
const databaseBuffer = require('../database-buffer');
const _ = require('lodash');

module.exports = function buildCampaignSkill({ campaignId, skillId = 'recSKI456' } = {}) {
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
