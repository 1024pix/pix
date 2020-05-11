const Badge = require('../../../../lib/domain/models/Badge');

const buildBadgeCriterion = require('./build-badge-criterion');
const buildBadgePartnerCompetence = require('./build-badge-partner-competence');

const faker = require('faker');

module.exports = function buildBadge(
  {
    id = 1,
    altMessage = faker.lorem.sentence(),
    imageUrl = '/img/banana',
    message = faker.lorem.sentence(),
    key = faker.lorem.word(),
    targetProfileId = faker.random.number(2),
    badgeCriteria = [
      buildBadgeCriterion(),
    ],
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
    key,
    targetProfileId,
    badgeCriteria,
    badgePartnerCompetences,
  });
};
