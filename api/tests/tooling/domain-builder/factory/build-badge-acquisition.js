const BadgeAcquisition = require('../../../../lib/domain/models/BadgeAcquisition');

module.exports = function buildBadgeAcquisition({
  id = 123,
  userId = 456,
  badgeId = 789,
} = {}) {

  return new BadgeAcquisition({
    id,
    userId,
    badgeId,
  });
};
