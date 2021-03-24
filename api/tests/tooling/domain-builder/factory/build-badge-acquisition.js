const BadgeAcquisition = require('../../../../lib/domain/models/BadgeAcquisition');
const faker = require('faker');

module.exports = function buildBadgeAcquisition(
  {
    id = faker.random.number(),
    userId = faker.random.number(),
    badgeId = faker.lorem.number(),
    campaignParticipationId = faker.random.number(),
  } = {}) {

  return new BadgeAcquisition({
    id,
    userId,
    badgeId,
    campaignParticipationId,
  });
};
