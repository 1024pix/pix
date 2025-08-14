import { UserNotAuthorizedToAccessEntityError } from '../../../../shared/domain/errors.js';
import * as injectedCampaignParticipationRepository from '../../infrastructure/repositories/campaign-participation-repository.js';
import { participationResultCalculationJobRepository as injectedParticipationResultCalculationJobRepository } from '../../infrastructure/repositories/jobs/participation-result-calculation-job-repository.js';
import { participationSharedJobRepository as injectedParticipationSharedJobRepository } from '../../infrastructure/repositories/jobs/participation-shared-job-repository.js';
import { ParticipationResultCalculationJob } from '../models/ParticipationResultCalculationJob.js';
import { ParticipationSharedJob } from '../models/ParticipationSharedJob.js';

const shareCampaignResult = async function ({
  userId,
  campaignParticipationId,
  campaignParticipationRepository = injectedCampaignParticipationRepository,
  participationResultCalculationJobRepository = injectedParticipationResultCalculationJobRepository,
  participationSharedJobRepository = injectedParticipationSharedJobRepository,
} = {}) {
  const campaignParticipation = await campaignParticipationRepository.getLocked(campaignParticipationId);

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
