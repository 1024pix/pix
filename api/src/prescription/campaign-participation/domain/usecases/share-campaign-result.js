import { UserNotAuthorizedToAccessEntityError } from '../../../../shared/domain/errors.js';
import { ParticipationResultCalculationJob } from '../models/ParticipationResultCalculationJob.js';
import { ParticipationSharedJob } from '../models/ParticipationSharedJob.js';

const shareCampaignResult = async function ({
  userId,
  campaignParticipationId,
  campaignParticipationRepository,
  participationResultCalculationJobRepository,
  participationSharedJobRepository,
}) {
  const campaignParticipation = await campaignParticipationRepository.get(campaignParticipationId);

  _checkUserIsOwnerOfCampaignParticipation(campaignParticipation, userId);

  campaignParticipation.share();
  await campaignParticipationRepository.updateWithSnapshot(campaignParticipation);

  await participationResultCalculationJobRepository.performAsync(
    new ParticipationResultCalculationJob({ campaignParticipationId }),
  );
  await participationSharedJobRepository.performAsync(
    new ParticipationSharedJob({
      campaignParticipationId,
    }),
  );
};

export { shareCampaignResult };

function _checkUserIsOwnerOfCampaignParticipation(campaignParticipation, userId) {
  if (campaignParticipation.userId !== userId) {
    throw new UserNotAuthorizedToAccessEntityError('User does not have an access to this campaign participation');
  }
}
