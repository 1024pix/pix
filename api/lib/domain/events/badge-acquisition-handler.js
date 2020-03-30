const badgeCriteriaService = require('../services/badge-criteria-service');

const badgeAcquisitionRepository = require('../../infrastructure/repositories/badge-acquisition-repository');
const badgeRepository = require('../../infrastructure/repositories/badge-repository');
const campaignParticipationResultRepository = require('../../infrastructure/repositories/campaign-participation-result-repository');

const badgeAcquisitionHandler = {
  handle: async function(domainTransaction, event) {
    if (event.targetProfileId != null) {
      const badge = await badgeRepository.findOneByTargetProfileId(event.targetProfileId);
      if (badge != null) {
        const campaignParticipationResult = await campaignParticipationResultRepository.getByParticipationId(event.campaignParticipationId);
        const areBadgeCriteriaFulfilled = badgeCriteriaService.areBadgeCriteriaFulfilled({ campaignParticipationResult });
        if (areBadgeCriteriaFulfilled) {
          await badgeAcquisitionRepository.create(domainTransaction, { badgeId: badge.id, userId: event.userId });
        }
      }
    }
  }
};

module.exports = {
  badgeAcquisitionHandler: badgeAcquisitionHandler,
};
