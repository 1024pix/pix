import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import {
  AuditLoggingJob,
  CampaignParticipationLoggerContext,
} from '../../../../shared/domain/models/jobs/AuditLoggingJob.js';
import chunk from '../../../../shared/infrastructure/utils/chunk.js';

const CHUNK_SIZE = 1000;

const deleteCampaignParticipation = async function ({
  userId,
  campaignId,
  campaignParticipationId,
  userRole,
  client,
  badgeAcquisitionRepository,
  campaignParticipationRepository,
  auditLoggingJobRepository,
  assessmentRepository,
  userRecommendedTrainingRepository,
  keepPreviousDeleted = false,
  chunkSize = CHUNK_SIZE,
}) {
  const campaignParticipations =
    await campaignParticipationRepository.getAllCampaignParticipationsInCampaignForASameLearner({
      campaignId,
      campaignParticipationId,
      keepPreviousDeleted,
    });

  const auditLoggingJobs = chunk(campaignParticipations, chunkSize).map((campaignParticipationsChunk) =>
    AuditLoggingJob.forUsers({
      client,
      action: CampaignParticipationLoggerContext.DELETION,
      role: userRole,
      userIds: campaignParticipationsChunk.map(({ id }) => id),
      updatedByUserId: userId,
      data: {},
    }),
  );

  const campaignParticipationToDelete = [];

  await DomainTransaction.execute(async () => {
    for (const campaignParticipation of campaignParticipations) {
      campaignParticipation.delete(userId);
      campaignParticipationToDelete.push(campaignParticipation.dataToUpdateOnDeletion);
    }

    await campaignParticipationRepository.updateInBatchByIds(campaignParticipationToDelete);

    const campaignParticipationIds = campaignParticipations.map(({ id }) => id);
    await badgeAcquisitionRepository.deleteUserIdOnNonCertifiableBadgesForCampaignParticipations(
      campaignParticipationIds,
    );
    await userRecommendedTrainingRepository.deleteCampaignParticipationIds({ campaignParticipationIds });

    const assessments = await assessmentRepository.getByCampaignParticipationIds(campaignParticipationIds);
    assessments.forEach((assessment) => assessment.detachCampaignParticipation());
    await assessmentRepository.batchRemoveParticipationId(assessments);
  });

  await auditLoggingJobRepository.performManyAsync(auditLoggingJobs);
};

export { deleteCampaignParticipation };
