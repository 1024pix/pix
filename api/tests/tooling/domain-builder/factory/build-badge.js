const Badge = require('../../../../lib/domain/models/Badge');

const buildBadgePartnerCompetence = require('./build-badge-partner-competence');

const faker = require('faker');

module.exports = function buildBadge(
  {
    id = 1,
    altMessage = faker.lorem.sentence(),
    imageUrl = '/img/banana',
    message = faker.lorem.sentence(),
    targetProfileId = faker.random.number(2),
    badgePartnerCompetences = [
      buildBadgePartnerCompetence(),
      buildBadgePartnerCompetence(),
    ],
  } = {}) {
  return new Badge({
    id,
    altMessage,
    imageUrl,
    message,
    targetProfileId,
    badgePartnerCompetences,
  });
};
