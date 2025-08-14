import * as injectedUserRecommendedTrainingRepository from '../../../../devcomp/infrastructure/repositories/user-recommended-training-repository.js';
import * as injectedBadgeAcquisitionRepository from '../../../../evaluation/infrastructure/repositories/badge-acquisition-repository.js';
import * as injectedOrganizationsProfileRewardRepository from '../../../../profile/infrastructure/repositories/organizations-profile-reward-repository.js';
import { withTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { EventLoggingJob } from '../../../../shared/domain/models/jobs/EventLoggingJob.js';
import { featureToggles as injectedFeatureToggles } from '../../../../shared/infrastructure/feature-toggles/index.js';
import * as injectedAssessmentRepository from '../../../../shared/infrastructure/repositories/assessment-repository.js';
import { eventLoggingJobRepository as injectedEventLoggingJobRepository } from '../../../../shared/infrastructure/repositories/jobs/event-logging-job.repository.js';
import * as injectedCampaignParticipationRepositoryfromBC from '../../../campaign-participation/infrastructure/repositories/campaign-participation-repository.js';
import * as injectedOrganizationLearnerRepository from '../../infrastructure/repositories/organization-learner-repository.js';
import { OrganizationLearnerList } from '../models/OrganizationLearnerList.js';

const deleteOrganizationLearners = withTransaction(async function ({
  organizationLearnerIds,
  userId,
  organizationId,
  userRole,
  client,
  organizationLearnerRepository = injectedOrganizationLearnerRepository,
  featureToggles = injectedFeatureToggles,
  campaignParticipationRepositoryfromBC = injectedCampaignParticipationRepositoryfromBC,
  badgeAcquisitionRepository = injectedBadgeAcquisitionRepository,
  assessmentRepository = injectedAssessmentRepository,
  eventLoggingJobRepository = injectedEventLoggingJobRepository,
  userRecommendedTrainingRepository = injectedUserRecommendedTrainingRepository,
  organizationsProfileRewardRepository = injectedOrganizationsProfileRewardRepository,
} = {}) {
  if (organizationLearnerIds.length === 0) {
    return;
  }

  const organizationLearnersFromOrganization =
    await organizationLearnerRepository.findOrganizationLearnersByOrganizationId({
      organizationId,
    });

  const organizationLearnerList = new OrganizationLearnerList({
    organizationId,
    organizationLearners: organizationLearnersFromOrganization,
  });

  const organizationLearnersToDelete = organizationLearnerList.getDeletableOrganizationLearners(
    organizationLearnerIds,
    userId,
  );

  const isAnonymizationWithDeletionEnabled = await featureToggles.get('isAnonymizationWithDeletionEnabled');

  const organizationProfileRewards = await organizationsProfileRewardRepository.getByOrganizationId({ organizationId });

  for (const organizationLearner of organizationLearnersToDelete) {
    const organizationLearnerRewards = organizationProfileRewards.filter(
      (organizationProfileReward) => organizationProfileReward.userId === organizationLearner.userId,
    );
    organizationLearner.delete(userId, isAnonymizationWithDeletionEnabled);
    await organizationLearnerRepository.remove(organizationLearner.dataToUpdateOnDeletion);

    if (isAnonymizationWithDeletionEnabled) {
      for (const organizationLearnerReward of organizationLearnerRewards) {
        await organizationsProfileRewardRepository.remove(organizationLearnerReward);
      }

      await eventLoggingJobRepository.performAsync(
        EventLoggingJob.forUser({
          client,
          action: organizationLearner.loggerContext,
          role: userRole,
          userId: organizationLearner.id,
          updatedByUserId: userId,
          data: {},
        }),
      );
    }

    const campaignParticipations =
      await campaignParticipationRepositoryfromBC.getAllCampaignParticipationsForOrganizationLearner({
        organizationLearnerId: organizationLearner.id,
      });

    for (const campaignParticipation of campaignParticipations) {
      campaignParticipation.delete(userId, isAnonymizationWithDeletionEnabled);
      await campaignParticipationRepositoryfromBC.remove(campaignParticipation.dataToUpdateOnDeletion);

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
      const assessments = await assessmentRepository.getByCampaignParticipationIds(campaignParticipationIds);
      for (const assessment of assessments) {
        assessment.detachCampaignParticipation();
        await assessmentRepository.updateCampaignParticipationId(assessment);
      }

      await userRecommendedTrainingRepository.deleteCampaignParticipationIds({ campaignParticipationIds });
    }
  }
});

export { deleteOrganizationLearners };
