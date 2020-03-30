const badgeCriteriaService = require('../services/badge-criteria-service');

const badgeAcquisitionRepository = require('../../infrastructure/repositories/badge-acquisition-repository');
const badgeRepository = require('../../infrastructure/repositories/badge-repository');
const campaignParticipationResultRepository = require('../../infrastructure/repositories/campaign-participation-result-repository');

const badgeAcquisitionHandler = {
  handle: async function(domainTransaction, assessmentCompletedEvent) {
    if (completedAssessmentBelongsToACampaign(assessmentCompletedEvent)) {
      const badge = await fetchPossibleCampaignAssociatedBadge(assessmentCompletedEvent);
      if (isABadgeAssociatedToCampaign(badge)) {
        const campaignParticipationResult = await fetchCampaignParticipationResults(assessmentCompletedEvent);
        if (isBadgeAcquired(campaignParticipationResult)) {
          await badgeAcquisitionRepository.create(domainTransaction, { badgeId: badge.id, userId: assessmentCompletedEvent.userId });
        }
      }
    }
  }
};

function completedAssessmentBelongsToACampaign(assessmentCompletedEvent) {
  return assessmentCompletedEvent.targetProfileId != null;
}

async function fetchPossibleCampaignAssociatedBadge(assessmentCompletedEvent) {
  return await badgeRepository.findOneByTargetProfileId(assessmentCompletedEvent.targetProfileId);
}

function isABadgeAssociatedToCampaign(badge) {
  return badge != null;
}

async function fetchCampaignParticipationResults(assessmentCompletedEvent) {
  return await campaignParticipationResultRepository.getByParticipationId(assessmentCompletedEvent.campaignParticipationId);
}

function isBadgeAcquired(campaignParticipationResult) {
  return badgeCriteriaService.areBadgeCriteriaFulfilled({ campaignParticipationResult });
}

module.exports = {
  badgeAcquisitionHandler: badgeAcquisitionHandler,
};
