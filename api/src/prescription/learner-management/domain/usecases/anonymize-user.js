import { withTransaction } from '../../../../shared/domain/DomainTransaction.js';

export const anonymizeUser = withTransaction(
  async ({ userId, campaignParticipationRepositoryFromBC, organizationLearnerRepository }) => {
    const learners = await organizationLearnerRepository.findByUserId({ userId });

    for (const learner of learners) {
      learner.detachUser();
      await organizationLearnerRepository.update(learner);
    }

    const campaignParticipations = await campaignParticipationRepositoryFromBC.findAllByUserId({ userId });

    const campaignParticipationsToAnonymize = campaignParticipations.map((campaignParticipation) => {
      campaignParticipation.detachUser();
      return campaignParticipation.dataToUpdateOnAnonymisation;
    });

    await campaignParticipationRepositoryFromBC.updateInBatchByIds(campaignParticipationsToAnonymize);
  },
);
