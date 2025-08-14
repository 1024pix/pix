import { withTransaction } from '../../../../shared/domain/DomainTransaction.js';
import * as injectedCampaignParticipationRepositoryfromBC from '../../../campaign-participation/infrastructure/repositories/campaign-participation-repository.js';
import * as injectedOrganizationLearnerRepository from '../../infrastructure/repositories/organization-learner-repository.js';

export const anonymizeUser = withTransaction(
  async ({
    userId,
    campaignParticipationRepositoryfromBC = injectedCampaignParticipationRepositoryfromBC,
    organizationLearnerRepository = injectedOrganizationLearnerRepository,
  } = {}) => {
    const learners = await organizationLearnerRepository.findByUserId({ userId });
    for (const learner of learners) {
      learner.detachUser();
      await organizationLearnerRepository.update(learner);
      const campaignParticipations =
        await campaignParticipationRepositoryfromBC.getAllCampaignParticipationsForOrganizationLearner({
          organizationLearnerId: learner.id,
        });
      for (const campaignParticipation of campaignParticipations) {
        campaignParticipation.detachUser();
        await campaignParticipationRepositoryfromBC.update(campaignParticipation);
      }
    }
  },
);
