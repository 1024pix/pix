import * as CombinedCourseRepository from '../../../../quest/infrastructure/repositories/combined-courses/combined-course-repository.js';
import { CLIENTS, PIX_ORGA } from '../../../../shared/constants.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { AuditLoggingJob } from '../../../../shared/domain/models/jobs/AuditLoggingJob.js';
import { CampaignBelongsToCombinedCourseError } from '../errors.js';
import { CampaignsDestructor } from '../models/CampaignsDestructor.js';

const deleteCampaigns = async ({
  userId,
  organizationId,
  campaignIds,
  adminMemberRepository,
  assessmentRepository,
  badgeAcquisitionRepository,
  organizationMembershipRepository,
  campaignAdministrationRepository,
  campaignParticipationRepository,
  userRecommendedTrainingRepository,
  auditLoggingJobRepository,
  client,
  userRole,
  keepPreviousDeletion = false,
  isPartOfDeletingCombinedCourse = false,
}) => {
  let membership;
  let pixAdminRole = userRole;

  if (!pixAdminRole) {
    const pixAdminMember = await adminMemberRepository.get({ userId });
    pixAdminRole = pixAdminMember?.role;
    if (!pixAdminRole) {
      membership = await organizationMembershipRepository.getByUserIdAndOrganizationId({ userId, organizationId });
    }
  }

  if (!isPartOfDeletingCombinedCourse) {
    for (const campaignId of campaignIds) {
      const combinedCourses = await CombinedCourseRepository.findByCampaignId({ campaignId });
      if (combinedCourses.length > 0) {
        throw new CampaignBelongsToCombinedCourseError();
      }
    }
  }

  const campaignsToDelete = await campaignAdministrationRepository.findByIds(campaignIds);
  const campaignParticipationsToDelete = await campaignParticipationRepository.getByCampaignIds(campaignIds, {
    withDeletedParticipation: keepPreviousDeletion,
  });

  const campaignDestructor = new CampaignsDestructor({
    campaignsToDelete,
    campaignParticipationsToDelete,
    userId,
    organizationId,
    membership,
    pixAdminRole,
  });
  campaignDestructor.delete({ keepPreviousDeletion });

  const auditLoggingJobs = [];
  const campaignParticipationsToUpdate = [];

  await DomainTransaction.execute(async () => {
    for (const campaignParticipation of campaignDestructor.campaignParticipations) {
      auditLoggingJobs.push(
        AuditLoggingJob.forUser({
          client: client ?? CLIENTS.ORGA,
          action: campaignParticipation.loggerContext,
          role: userRole ?? PIX_ORGA.ROLES.ADMIN,
          userId: campaignParticipation.id,
          updatedByUserId: userId,
          data: {},
        }),
      );

      campaignParticipationsToUpdate.push(campaignParticipation.dataToUpdateOnDeletion);
    }

    await campaignParticipationRepository.updateInBatchByIds(campaignParticipationsToUpdate);

    const campaignParticipationIds = campaignParticipationsToDelete.map(({ id }) => id);

    await userRecommendedTrainingRepository.deleteCampaignParticipationIds({
      campaignParticipationIds,
    });
    await badgeAcquisitionRepository.deleteUserIdOnNonCertifiableBadgesForCampaignParticipations(
      campaignParticipationIds,
    );
    const assessments = await assessmentRepository.getByCampaignParticipationIds(campaignParticipationIds);

    assessments.forEach((assessment) => assessment.detachCampaignParticipation());
    await assessmentRepository.batchRemoveParticipationId(assessments);

    const campaignIdsToDelete = campaignDestructor.campaigns.map(({ id }) => id);

    await campaignAdministrationRepository.deleteExternalIdLabelFromCampaigns(campaignIdsToDelete);

    await campaignAdministrationRepository.removeInBatch(campaignsToDelete);
  });

  for (const auditLoggingJob of auditLoggingJobs) {
    await auditLoggingJobRepository.performAsync(auditLoggingJob);
  }
};

export { deleteCampaigns };
