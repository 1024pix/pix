const badgeAcquisitionRepository = require('../../infrastructure/repositories/badge-acquisition-repository');
const badgeRepository = require('../../infrastructure/repositories/badge-repository');

const cleaBadgeCreationHandler = {
  inject: function(campaignParticipationResultFactory, badgeCriteriaService) {
    return {
      handle: async function(domainTransaction, event) {
        if (event.targetProfileId != null) {
          const badge = await badgeRepository.findOneByTargetProfileId(event.targetProfileId);
          if (badge != null) {
            const campaignParticipationResult = await campaignParticipationResultFactory.create(event.campaignParticipationId);
            const areBadgeCriteriaFulfilled = badgeCriteriaService.areBadgeCriteriaFulfilled({ campaignParticipationResult });
            if (areBadgeCriteriaFulfilled) {
              await badgeAcquisitionRepository.create(domainTransaction, { badgeId: badge.id, userId: event.userId });
            }
          }
        }
      }
    };
  }
};

module.exports = {
  cleaBadgeCreationHandler,
};
