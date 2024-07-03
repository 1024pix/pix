import bluebird from 'bluebird';

import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';

const deleteCampaignParticipationForAdmin = async function ({
  userId,
  campaignParticipationId,
  campaignRepository,
  campaignParticipationRepository,
}) {
  await DomainTransaction.execute(async () => {
    const campaignId = await campaignRepository.getCampaignIdByCampaignParticipationId(campaignParticipationId);

    const campaignParticipations =
      await campaignParticipationRepository.getAllCampaignParticipationsInCampaignForASameLearner({
        campaignId,
        campaignParticipationId,
      });

    await bluebird.mapSeries(campaignParticipations, async (campaignParticipation) => {
      campaignParticipation.delete(userId);
      const { id, deletedAt, deletedBy } = campaignParticipation;
      await campaignParticipationRepository.remove({ id, deletedAt, deletedBy });
    });
  });
};

export { deleteCampaignParticipationForAdmin };
