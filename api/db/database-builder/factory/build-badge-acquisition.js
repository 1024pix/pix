const databaseBuffer = require('../database-buffer');
const buildCampaignParticipation = require('./build-campaign-participation');

module.exports = function buildBadgeAcquisition({
  id = databaseBuffer.getNextId(),
  badgeId,
  userId,
  campaignParticipationId = buildCampaignParticipation().id,
  createdAt = new Date('2000-01-01'),
} = {}) {
  return databaseBuffer.pushInsertable({
    tableName: 'badge-acquisitions',
    values: {
      id,
      badgeId,
      userId,
      campaignParticipationId,
      createdAt,
    },
  });
};
