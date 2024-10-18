import * as campaignParticipationRepository from '../../../campaign-participation/infrastructure/repositories/campaign-participation-repository.js';
import { CampaignParticipationDoesNotBelongToUser } from '../../domain/errors.js';

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
