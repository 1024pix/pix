import { CampaignParticipationBadge } from '../../../../lib/domain/models/CampaignParticipationBadge.js';

const buildCampaignParticipationBadge = function ({
  id = 123,
  key,
  altMessage,
  imageUrl,
  message,
  title,
  isAcquired = false,
  isCertifiable = false,
  badgeCriteria = [],
  skillSets = [],
  skillSetResults = [],
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
    skillSets,
    skillSetResults,
  });
};

export { buildCampaignParticipationBadge };
