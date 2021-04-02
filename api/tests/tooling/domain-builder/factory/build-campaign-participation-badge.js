const CampaignParticipationBadge = require('../../../../lib/domain/models/CampaignParticipationBadge');

module.exports = function buildCampaignParticipationBadge({
  id = 123,
  key,
  altMessage,
  imageUrl,
  message,
  title,
  isAcquired = false,
  isCertifiable = false,
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
    isCertifiable,
    badgeCriteria,
    badgePartnerCompetences,
    partnerCompetenceResults,
  });
};
