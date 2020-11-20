const BadgePartnerCompetence = require('../../../../lib/domain/models/BadgePartnerCompetence');
const faker = require('faker');

module.exports = function buildBadgePartnerCompetence(
  {
    id = 1,
    name = faker.lorem.words(),
    color = null,
    skillIds = [
      `rec${faker.random.uuid()}`,
      `rec${faker.random.uuid()}`,
    ],
  } = {}) {
  return new BadgePartnerCompetence({
    id,
    name,
    color,
    skillIds,
  });
};
