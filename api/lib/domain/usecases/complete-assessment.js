import { PoleEmploiParticipationCompletedJob } from '../../../src/prescription/campaign-participation/domain/models/PoleEmploiParticipationCompletedJob.js';
import { CampaignParticipationStatuses } from '../../../src/prescription/shared/domain/constants.js';
import { AlreadyRatedAssessmentError } from '../../../src/shared/domain/errors.js';
import { CertificationCompletedJob } from '../events/CertificationCompleted.js';

const completeAssessment = async function ({
  assessmentId,
  campaignParticipationBCRepository,
  assessmentRepository,
  certificationCompletedJobRepository,
  poleEmploiParticipationCompletedJobRepository,
  locale,
}) {
  const assessment = await assessmentRepository.get(assessmentId);

  if (assessment.isCompleted()) {
    throw new AlreadyRatedAssessmentError();
  }

  await assessmentRepository.completeByAssessmentId(assessmentId);

  if (assessment.campaignParticipationId) {
    const { TO_SHARE } = CampaignParticipationStatuses;

    await campaignParticipationBCRepository.update({ id: assessment.campaignParticipationId, status: TO_SHARE });

    await poleEmploiParticipationCompletedJobRepository.performAsync(
      new PoleEmploiParticipationCompletedJob({ campaignParticipationId: assessment.campaignParticipationId }),
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
