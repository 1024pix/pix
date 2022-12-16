const buildBadge = require('./build-badge');
const BadgeAcquisition = require('../../../../lib/domain/models/BadgeAcquisition');

const buildBadgeAcquisition = function buildBadgeAcquisition({
  id = 123,
  userId = 456,
  badgeId = 789,
  campaignParticipationId = 159,
  badge,
} = {}) {
  badge = badge || buildBadge({ id: badgeId });
  return new BadgeAcquisition({
    id,
    userId,
    badgeId,
    campaignParticipationId,
    badge,
  });
};

module.exports = buildBadgeAcquisition;
