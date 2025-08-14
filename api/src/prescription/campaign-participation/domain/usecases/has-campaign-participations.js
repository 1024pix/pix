import { withTransaction } from '../../../../shared/domain/DomainTransaction.js';
import * as injectedCampaignParticipationRepository from '../../infrastructure/repositories/campaign-participation-repository.js';

export const hasCampaignParticipations = withTransaction(async function ({
  userId,
  campaignParticipationRepository = injectedCampaignParticipationRepository,
} = {}) {
  const campaignParticipationsCount = await campaignParticipationRepository.getCampaignParticipationsCountByUserId({
    userId,
  });
  return Boolean(campaignParticipationsCount);
});
