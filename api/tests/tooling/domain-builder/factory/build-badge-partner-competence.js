const BadgePartnerCompetenceViewModel = require('../../../../lib/domain/models/BadgePartnerCompetenceViewModel');
const faker = require('faker');

module.exports = function buildBadgePartnerCompetence(
  {
    id = 1,
    name = faker.lorem.words(),
    color = 'jaffa',
    skillIds = [
      faker.random.number(2),
      faker.random.number(2),
    ],
  } = {}) {
  return new BadgePartnerCompetenceViewModel({
    id,
    name,
    color,
    skillIds,
  });
};
