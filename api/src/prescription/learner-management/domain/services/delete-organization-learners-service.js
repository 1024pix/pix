import _ from 'lodash';

import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { AuditLoggingJob } from '../../../../shared/domain/models/jobs/AuditLoggingJob.js';
import {
  CampaignParticipationLoggerContext,
  OrganizationLearnerLoggerContext,
} from '../../../../shared/domain/models/jobs/AuditLoggingJob.js';

const CHUNK_SIZE = 1000;

export const deleteOrganizationLearnersService = async function ({
  organizationLearners,
  userId,
  organizationId,
  userRole,
  learnerToDeleteChunkSize = CHUNK_SIZE,
  client,
  disableAuditLogger = false, // true in case of dryRun to not instantiate jobs
  organizationLearnerRepository,
  organizationLearnerImportFormatRepository,
  campaignParticipationRepository,
  badgeAcquisitionRepository,
  assessmentRepository,
  auditLoggingJobRepository,
  userRecommendedTrainingRepository,
  organizationsProfileRewardRepository,
}) {
  if (organizationLearners.length === 0) {
    return;
  }

  const learnerToDeleteJobBatches = _.chunk(organizationLearners, learnerToDeleteChunkSize);

  const importFormat = await organizationLearnerImportFormatRepository.get(organizationId);
  const organizationProfileRewards = await organizationsProfileRewardRepository.getByOrganizationId({ organizationId });
  const organizationProfileRewardsByUserId = Map.groupBy(organizationProfileRewards, ({ userId }) => userId);

  const auditLoggingJobs = [];
  const campaignParticipationsToDelete = [];
  const allCampaignParticipationIds = [];

  await DomainTransaction.execute(async () => {
    const organizationLearnersToUpdate = [];
    const organizationProfileRewardsToUpdate = [];
    const computedOrganizationLearnerIds = [];

    for (const organizationLearner of organizationLearners) {
      computedOrganizationLearnerIds.push(organizationLearner.id);
      const organizationLearnerRewards = organizationProfileRewardsByUserId.get(organizationLearner.userId) ?? [];
      organizationLearner.delete(userId, importFormat);
      organizationLearnersToUpdate.push(organizationLearner.dataToUpdateOnDeletion);
      organizationProfileRewardsToUpdate.push(...organizationLearnerRewards);
    }

    for (const learnerToDeleteBatch of learnerToDeleteJobBatches) {
      auditLoggingJobs.push(
        AuditLoggingJob.forUsers({
          client,
          action: OrganizationLearnerLoggerContext.DELETION,
          role: userRole,
          userIds: learnerToDeleteBatch.map(({ id }) => id),
          updatedByUserId: userId,
          data: {},
        }),
      );
    }

    const campaignParticipations =
      await campaignParticipationRepository.getAllCampaignParticipationsForOrganizationLearnerIds({
        organizationLearnerIds: computedOrganizationLearnerIds,
      });

    for (const campaignParticipation of campaignParticipations) {
      campaignParticipation.delete(userId);
      campaignParticipationsToDelete.push(campaignParticipation.dataToUpdateOnDeletion);
      allCampaignParticipationIds.push(campaignParticipation.id);
    }
    const participationToDeleteJobBatches = _.chunk(campaignParticipations, learnerToDeleteChunkSize);
    for (const participationToDeleteJobBatch of participationToDeleteJobBatches) {
      auditLoggingJobs.push(
        AuditLoggingJob.forUsers({
          client,
          action: CampaignParticipationLoggerContext.DELETION,
          role: userRole,
          userIds: participationToDeleteJobBatch.map(({ id }) => id),
          updatedByUserId: userId,
          data: {},
        }),
      );
    }

    const assessments = await assessmentRepository.getByCampaignParticipationIds(allCampaignParticipationIds);
    assessments.forEach((assessment) => assessment.detachCampaignParticipation());

    await organizationLearnerRepository.updateInBatchByIds(organizationLearnersToUpdate);
    await campaignParticipationRepository.updateInBatchByIds(campaignParticipationsToDelete);
    await assessmentRepository.batchRemoveParticipationId(assessments);
    await badgeAcquisitionRepository.deleteUserIdOnNonCertifiableBadgesForCampaignParticipations(
      allCampaignParticipationIds,
    );
    await organizationsProfileRewardRepository.removeInBatch(organizationProfileRewardsToUpdate);
    await userRecommendedTrainingRepository.deleteCampaignParticipationIds({
      campaignParticipationIds: allCampaignParticipationIds,
    });
  });

  if (disableAuditLogger) return;

  await auditLoggingJobRepository.performManyAsync(auditLoggingJobs);
};
