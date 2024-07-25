import { CantCalculateCampaignParticipationResultError } from '../../../src/shared/domain/errors.js';

const saveComputedCampaignParticipationResult = async function ({
  participantResultsSharedRepository,
  campaignParticipationRepository,
  campaignParticipationId,
}) {
  const campaignParticipation = await campaignParticipationRepository.get(campaignParticipationId);
  if (!campaignParticipation.isShared) throw new CantCalculateCampaignParticipationResultError();

  const participantResultsShared = await participantResultsSharedRepository.get(campaignParticipationId);
  return participantResultsSharedRepository.save(participantResultsShared);
};

export { saveComputedCampaignParticipationResult };
