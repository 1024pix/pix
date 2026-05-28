import { CLIENTS, PIX_ADMIN } from '../../../shared/domain/constants.js';
import { withTransaction } from '../../../shared/domain/DomainTransaction.js';

export const deleteAndAnonymizeParticipationsForALearnerId = withTransaction(
  async ({
    organizationLearnerParticipationRepository,
    campaignRepository,
    combinedCourseId,
    userId,
    organizationLearnerId,
    campaignParticipationRepository,
  }) => {
    await organizationLearnerParticipationRepository.deleteCombinedCourseParticipationByCombinedCourseIdAndOrganizationLearnerId(
      { combinedCourseId, userId, organizationLearnerId },
    );
    const campaignIds = await campaignRepository.getCampaignIdsByCombinedCourseIds({
      combinedCourseIds: [combinedCourseId],
    });

    for (const campaignId of campaignIds) {
      const campaignParticipations =
        await campaignParticipationRepository.getCampaignParticipationsByLearnerIdAndCampaignId({
          organizationLearnerId,
          campaignId,
        });
      const campaignParticipationIds = campaignParticipations.map((campaignParticipation) => campaignParticipation.id);
      await campaignParticipationRepository.deleteCampaignParticipations({
        userId,
        campaignId: campaignId,
        campaignParticipationIds,
        userRole: PIX_ADMIN.ROLES.SUPER_ADMIN,
        client: CLIENTS.SCRIPT,
      });
    }
  },
);
