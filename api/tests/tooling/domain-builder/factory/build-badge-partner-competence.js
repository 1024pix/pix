const BadgePartnerCompetence = require('../../../../lib/domain/models/BadgePartnerCompetence');
const faker = require('faker');

module.exports = function buildBadgePartnerCompetence(
  {
    id = 1,
    name = faker.lorem.words(),
    color = null,
    skillIds = [
      faker.random.number(2),
      faker.random.number(2),
    ],
    badgeId,
  } = {}) {
  return new BadgePartnerCompetence({
    id,
    name,
    color,
    skillIds,
    badgeId,
  });
};
