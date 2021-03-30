const databaseBuffer = require('../database-buffer');

module.exports = function buildBadgeAcquisition({
  id,
  badgeId,
  userId,
  campaignParticipationId,
} = {}) {

  return databaseBuffer.pushInsertable({
    tableName: 'badge-acquisitions',
    values: {
      id,
      badgeId,
      userId,
      campaignParticipationId,
    },
  });
};
