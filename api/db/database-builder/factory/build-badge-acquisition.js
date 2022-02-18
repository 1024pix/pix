const databaseBuffer = require('../database-buffer');

module.exports = function buildBadgeAcquisition({
  id = databaseBuffer.getNextId(),
  badgeId,
  userId,
  campaignParticipationId,
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
