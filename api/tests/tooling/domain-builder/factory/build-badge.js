const EndOfParticipationBadgeViewModel = require('../../../../lib/domain/models/EndOfParticipationBadgeViewModel');

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
    badgePartnerCompetences = [
      buildBadgePartnerCompetence(),
      buildBadgePartnerCompetence(),
    ],
  } = {}) {
  return new EndOfParticipationBadgeViewModel({
    id,
    altMessage,
    imageUrl,
    message,
    key,
    targetProfileId,
    badgePartnerCompetences,
  });
};
