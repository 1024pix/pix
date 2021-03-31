const BadgeAcquisition = require('../../../../lib/domain/models/BadgeAcquisition');

module.exports = function buildBadgeAcquisition({
  id = 123,
  userId = 456,
  badgeId = 789,
  campaignParticipationId = 159,
} = {}) {

  return new BadgeAcquisition({
    id,
    userId,
    badgeId,
    campaignParticipationId,
  });
};
