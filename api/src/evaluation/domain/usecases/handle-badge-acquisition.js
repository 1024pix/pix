import _ from 'lodash';

import * as injectedBadgeForCalculationRepository from '../../../shared/infrastructure/repositories/badge-for-calculation-repository.js';
import { repositories as injectedRepositories } from '../../../shared/infrastructure/repositories/index.js';
import * as injectedBadgeAcquisitionRepository from '../../infrastructure/repositories/badge-acquisition-repository.js';

const handleBadgeAcquisition = async function ({
  assessment,
  badgeForCalculationRepository = injectedBadgeForCalculationRepository,
  badgeAcquisitionRepository = injectedBadgeAcquisitionRepository,
  knowledgeElementRepository = injectedRepositories.knowledgeElementRepository,
} = {}) {
  if (assessment.isForCampaign()) {
    const campaignParticipationId = assessment.campaignParticipationId;
    const associatedBadges = await _fetchPossibleCampaignAssociatedBadges(
      campaignParticipationId,
      badgeForCalculationRepository,
    );
    if (_.isEmpty(associatedBadges)) {
      return;
    }
    const knowledgeElements = await knowledgeElementRepository.findUniqByUserIdForCampaignParticipation({
      userId: assessment.userId,
      campaignParticipationId,
    });

    const obtainedBadgesByUser = associatedBadges.filter((badge) => badge.shouldBeObtained(knowledgeElements));

    const badgeAcquisitionsToCreate = obtainedBadgesByUser.map((badge) => {
      return {
        badgeId: badge.id,
        userId: assessment.userId,
        campaignParticipationId: assessment.campaignParticipationId,
      };
    });

    if (!_.isEmpty(badgeAcquisitionsToCreate)) {
      await badgeAcquisitionRepository.createOrUpdate({ badgeAcquisitionsToCreate });
    }
  }
};

function _fetchPossibleCampaignAssociatedBadges(campaignParticipationId, badgeForCalculationRepository) {
  return badgeForCalculationRepository.findByCampaignParticipationId({ campaignParticipationId });
}

export { handleBadgeAcquisition };
