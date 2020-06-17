const CampaignParticipationBadge = require('../../../../lib/domain/models/CampaignParticipationBadge');
const faker = require('faker');

module.exports = function buildCampaignParticipationBadge(
  {
    id = faker.random.number(),
    key,
    altMessage,
    imageUrl,
    message,
    title,
    isAcquired = false,
    badgeCriteria = [],
    badgePartnerCompetences = [],
    partnerCompetenceResults = [],
  } = {}) {

  return new CampaignParticipationBadge({
    id,
    key,
    altMessage,
    imageUrl,
    message,
    title,
    isAcquired,
    badgeCriteria,
    badgePartnerCompetences,
    partnerCompetenceResults,
  });
};
