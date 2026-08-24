import { CampaignParticipationDoesNotBelongToUser } from '../../../campaign/domain/errors.js';
import * as campaignParticipationRepository from '../../infrastructure/repositories/campaign-participation-repository.js';

const execute = async function ({
  userId,
  campaignParticipationId,
  dependencies = { campaignParticipationRepository },
}) {
  const campaignParticipation = await dependencies.campaignParticipationRepository.get(campaignParticipationId);
  if (!campaignParticipation || campaignParticipation.userId !== userId) {
    throw new CampaignParticipationDoesNotBelongToUser();
  }
};

export { execute };
