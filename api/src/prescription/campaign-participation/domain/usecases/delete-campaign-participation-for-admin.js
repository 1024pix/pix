import { withTransaction } from '../../../../shared/domain/DomainTransaction.js';

const deleteCampaignParticipationForAdmin = withTransaction(async function ({
  userId,
  campaignParticipationId,
  campaignRepository,
  campaignParticipationRepository,
}) {
  const campaignId = await campaignRepository.getCampaignIdByCampaignParticipationId(campaignParticipationId);

  const campaignParticipations =
    await campaignParticipationRepository.getAllCampaignParticipationsInCampaignForASameLearner({
      campaignId,
      campaignParticipationId,
    });

  for (const campaignParticipation of campaignParticipations) {
    campaignParticipation.delete(userId);
    const { id, deletedAt, deletedBy } = campaignParticipation;
    await campaignParticipationRepository.remove({ id, deletedAt, deletedBy });
  }
});

export { deleteCampaignParticipationForAdmin };
