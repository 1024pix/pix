import * as injectedCampaignParticipationRepository from '../../infrastructure/repositories/campaign-participation-repository.js';
import { participantResultsSharedRepository as injectedParticipantResultsSharedRepository } from '../../infrastructure/repositories/participant-results-shared-repository.js';
import { CantCalculateCampaignParticipationResultError } from '../errors.js';

const saveComputedCampaignParticipationResult = async function ({
  participantResultsSharedRepository = injectedParticipantResultsSharedRepository,
  campaignParticipationRepository = injectedCampaignParticipationRepository,
  campaignParticipationId,
} = {}) {
  const campaignParticipation = await campaignParticipationRepository.get(campaignParticipationId);
  if (!campaignParticipation.isShared) throw new CantCalculateCampaignParticipationResultError();

  const participantResultsShared = await participantResultsSharedRepository.get(campaignParticipationId);
  return participantResultsSharedRepository.save(participantResultsShared);
};

export { saveComputedCampaignParticipationResult };
