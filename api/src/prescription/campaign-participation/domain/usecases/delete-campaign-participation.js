import * as injectedUserRecommendedTrainingRepository from '../../../../devcomp/infrastructure/repositories/user-recommended-training-repository.js';
import * as injectedBadgeAcquisitionRepository from '../../../../evaluation/infrastructure/repositories/badge-acquisition-repository.js';
import { withTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { EventLoggingJob } from '../../../../shared/domain/models/jobs/EventLoggingJob.js';
import { featureToggles as injectedFeatureToggles } from '../../../../shared/infrastructure/feature-toggles/index.js';
import * as injectedAssessmentRepository from '../../../../shared/infrastructure/repositories/assessment-repository.js';
import { eventLoggingJobRepository as injectedEventLoggingJobRepository } from '../../../../shared/infrastructure/repositories/jobs/event-logging-job.repository.js';
import * as injectedCampaignParticipationRepository from '../../infrastructure/repositories/campaign-participation-repository.js';

const deleteCampaignParticipation = withTransaction(async function ({
  userId,
  campaignId,
  campaignParticipationId,
  userRole,
  client,
  featureToggles = injectedFeatureToggles,
  badgeAcquisitionRepository = injectedBadgeAcquisitionRepository,
  campaignParticipationRepository = injectedCampaignParticipationRepository,
  eventLoggingJobRepository = injectedEventLoggingJobRepository,
  assessmentRepository = injectedAssessmentRepository,
  userRecommendedTrainingRepository = injectedUserRecommendedTrainingRepository,
} = {}) {
  const isAnonymizationWithDeletionEnabled = await featureToggles.get('isAnonymizationWithDeletionEnabled');

  const campaignParticipations =
    await campaignParticipationRepository.getAllCampaignParticipationsInCampaignForASameLearner({
      campaignId,
      campaignParticipationId,
    });

  for (const campaignParticipation of campaignParticipations) {
    campaignParticipation.delete(userId, isAnonymizationWithDeletionEnabled);
    await campaignParticipationRepository.remove(campaignParticipation.dataToUpdateOnDeletion);

    if (isAnonymizationWithDeletionEnabled) {
      await eventLoggingJobRepository.performAsync(
        EventLoggingJob.forUser({
          client,
          action: campaignParticipation.loggerContext,
          role: userRole,
          userId: campaignParticipation.id,
          updatedByUserId: userId,
          data: {},
        }),
      );
    }
  }
  if (isAnonymizationWithDeletionEnabled) {
    const campaignParticipationIds = campaignParticipations.map(({ id }) => id);
    await badgeAcquisitionRepository.deleteUserIdOnNonCertifiableBadgesForCampaignParticipations(
      campaignParticipationIds,
    );
    await userRecommendedTrainingRepository.deleteCampaignParticipationIds({ campaignParticipationIds });

    const assessments = await assessmentRepository.getByCampaignParticipationIds(campaignParticipationIds);
    for (const assessment of assessments) {
      assessment.detachCampaignParticipation();
      await assessmentRepository.updateCampaignParticipationId(assessment);
    }
  }
});

export { deleteCampaignParticipation };
