import { CertificationCompletedJob } from '../../../certification/evaluation/domain/events/CertificationCompleted.js';
import { certificationCompletedJobRepository as injectedCertificationCompletedJobRepository } from '../../../certification/evaluation/infrastructure/repositories/jobs/certification-completed-job-repository.js';
import { ParticipationCompletedJob } from '../../../prescription/campaign-participation/domain/models/ParticipationCompletedJob.js';
import * as injectedCampaignParticipationRepository from '../../../prescription/campaign-participation/infrastructure/repositories/campaign-participation-repository.js';
import { participationCompletedJobRepository as injectedParticipationCompletedJobRepository } from '../../../prescription/campaign-participation/infrastructure/repositories/jobs/participation-completed-job-repository.js';
import { CampaignParticipationStatuses } from '../../../prescription/shared/domain/constants.js';
import * as injectedAssessmentRepository from '../../../shared/infrastructure/repositories/assessment-repository.js';
import { AlreadyRatedAssessmentError } from '../errors.js';

const completeAssessment = async function ({
  assessmentId,
  campaignParticipationRepository = injectedCampaignParticipationRepository,
  assessmentRepository = injectedAssessmentRepository,
  certificationCompletedJobRepository = injectedCertificationCompletedJobRepository,
  participationCompletedJobRepository = injectedParticipationCompletedJobRepository,
  locale,
} = {}) {
  const assessment = await assessmentRepository.get(assessmentId);

  if (assessment.isCompleted()) {
    throw new AlreadyRatedAssessmentError();
  }

  await assessmentRepository.completeByAssessmentId(assessmentId);

  if (assessment.campaignParticipationId) {
    const { TO_SHARE } = CampaignParticipationStatuses;

    await campaignParticipationRepository.update({ id: assessment.campaignParticipationId, status: TO_SHARE });

    await participationCompletedJobRepository.performAsync(
      new ParticipationCompletedJob({ campaignParticipationId: assessment.campaignParticipationId }),
    );
  }

  if (assessment.certificationCourseId) {
    await certificationCompletedJobRepository.performAsync(
      new CertificationCompletedJob({
        assessmentId: assessment.id,
        userId: assessment.userId,
        certificationCourseId: assessment.certificationCourseId,
        locale,
      }),
    );
  }

  return assessment;
};

export { completeAssessment };
