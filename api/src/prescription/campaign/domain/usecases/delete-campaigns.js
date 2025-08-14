import * as injectedUserRecommendedTrainingRepository from '../../../../devcomp/infrastructure/repositories/user-recommended-training-repository.js';
import * as injectedBadgeAcquisitionRepository from '../../../../evaluation/infrastructure/repositories/badge-acquisition-repository.js';
import { EventLoggingJob } from '../../../../shared/domain/models/jobs/EventLoggingJob.js';
import { featureToggles as injectedFeatureToggles } from '../../../../shared/infrastructure/feature-toggles/index.js';
import { adminMemberRepository as injectedAdminMemberRepository } from '../../../../shared/infrastructure/repositories/admin-member.repository.js';
import * as injectedAssessmentRepository from '../../../../shared/infrastructure/repositories/assessment-repository.js';
import { eventLoggingJobRepository as injectedEventLoggingJobRepository } from '../../../../shared/infrastructure/repositories/jobs/event-logging-job.repository.js';
import { MembershipNotFound } from '../../../../team/application/api/errors/MembershipNotFound.js';
import * as injectedCampaignParticipationRepository from '../../../campaign-participation/infrastructure/repositories/campaign-participation-repository.js';
import * as injectedCampaignAdministrationRepository from '../../infrastructure/repositories/campaign-administration-repository.js';
import { CampaignsDestructor } from '../models/CampaignsDestructor.js';

const deleteCampaigns = async ({
  userId,
  organizationId,
  campaignIds,
  featureToggles = injectedFeatureToggles,
  adminMemberRepository = injectedAdminMemberRepository,
  assessmentRepository = injectedAssessmentRepository,
  badgeAcquisitionRepository = injectedBadgeAcquisitionRepository,
  organizationMembershipRepository,
  campaignAdministrationRepository = injectedCampaignAdministrationRepository,
  campaignParticipationRepository = injectedCampaignParticipationRepository,
  userRecommendedTrainingRepository = injectedUserRecommendedTrainingRepository,
  eventLoggingJobRepository = injectedEventLoggingJobRepository,
} = {}) => {
  let membership;

  try {
    membership = await organizationMembershipRepository.getByUserIdAndOrganizationId({ userId, organizationId });
  } catch (error) {
    if (!(error instanceof MembershipNotFound)) {
      throw error;
    }
  }
  const pixAdminMember = await adminMemberRepository.get({ userId });

  const campaignsToDelete = await campaignAdministrationRepository.getByIds(campaignIds);
  const campaignParticipationsToDelete = await campaignParticipationRepository.getByCampaignIds(campaignIds);

  const isAnonymizationWithDeletionEnabled = await featureToggles.get('isAnonymizationWithDeletionEnabled');

  const campaignDestructor = new CampaignsDestructor({
    campaignsToDelete,
    campaignParticipationsToDelete,
    userId,
    organizationId,
    membership,
    pixAdminRole: pixAdminMember?.role,
  });
  campaignDestructor.delete(isAnonymizationWithDeletionEnabled);

  for (const campaignParticipation of campaignDestructor.campaignParticipations) {
    await campaignParticipationRepository.update(campaignParticipation);

    if (isAnonymizationWithDeletionEnabled) {
      await eventLoggingJobRepository.performAsync(
        EventLoggingJob.forUser({
          client: 'PIX_ORGA',
          action: campaignParticipation.loggerContext,
          role: 'ORGA_ADMIN',
          userId: campaignParticipation.id,
          updatedByUserId: userId,
          data: {},
        }),
      );
    }
  }

  if (isAnonymizationWithDeletionEnabled) {
    const campaignParticipationIds = campaignParticipationsToDelete.map(({ id }) => id);

    await userRecommendedTrainingRepository.deleteCampaignParticipationIds({
      campaignParticipationIds,
    });
    await badgeAcquisitionRepository.deleteUserIdOnNonCertifiableBadgesForCampaignParticipations(
      campaignParticipationIds,
    );
    const assessments = await assessmentRepository.getByCampaignParticipationIds(campaignParticipationIds);
    for (const assessment of assessments) {
      assessment.detachCampaignParticipation();
      await assessmentRepository.updateCampaignParticipationId(assessment);
    }

    const campaignIdsToDelete = campaignDestructor.campaigns.map(({ id }) => id);

    await campaignAdministrationRepository.deleteExternalIdLabelFromCampaigns(campaignIdsToDelete);
  }

  await campaignAdministrationRepository.remove(campaignsToDelete);
};

export { deleteCampaigns };
