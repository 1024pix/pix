import { CLIENTS, PIX_ADMIN } from '../../../shared/constants.js';
import { withTransaction } from '../../../shared/domain/DomainTransaction.js';

export const deleteAndAnonymizeCombinedCourses = withTransaction(
  async ({
    combinedCourseRepository,
    organizationLearnerParticipationRepository,
    campaignRepository,
    combinedCourseIds,
    userId,
  }) => {
    await combinedCourseRepository.deleteCombinedCourses({
      combinedCourseIds,
      deletedBy: userId,
    });
    await organizationLearnerParticipationRepository.deleteCombinedCourseParticipations({ combinedCourseIds, userId });
    const campaigns = await campaignRepository.getCampaignsByCombinedCourseIds({
      combinedCourseIds,
    });

    for (const campaign of campaigns) {
      await campaignRepository.deleteCampaignsInCombinedCourses({
        userId,
        organizationId: campaign.organizationId,
        campaignIds: [campaign.id],
        keepPreviousDeletion: true,
        userRole: PIX_ADMIN.ROLES.SUPER_ADMIN,
        client: CLIENTS.SCRIPT,
      });
    }
  },
);
