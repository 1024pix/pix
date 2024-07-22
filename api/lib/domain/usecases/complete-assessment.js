import { CampaignParticipationStatuses } from '../../../src/prescription/shared/domain/constants.js';
import { AlreadyRatedAssessmentError } from '../../../src/shared/domain/errors.js';
import { AssessmentCompleted } from '../events/AssessmentCompleted.js';

const completeAssessment = async function ({
  assessmentId,
  domainTransaction,
  campaignParticipationBCRepository,
  assessmentRepository,
  locale,
}) {
  const assessment = await assessmentRepository.get(assessmentId, domainTransaction);

  if (assessment.isCompleted()) {
    throw new AlreadyRatedAssessmentError();
  }

  await assessmentRepository.completeByAssessmentId(assessmentId, domainTransaction);

  if (assessment.campaignParticipationId) {
    const { TO_SHARE } = CampaignParticipationStatuses;

    await campaignParticipationBCRepository.update(
      { id: assessment.campaignParticipationId, status: TO_SHARE },
      domainTransaction,
    );
  }

  const assessmentCompleted = new AssessmentCompleted({
    assessmentId: assessment.id,
    userId: assessment.userId,
    campaignParticipationId: assessment.campaignParticipationId,
    certificationCourseId: assessment.certificationCourseId,
    locale,
  });

  return {
    event: assessmentCompleted,
    assessment,
  };
};

export { completeAssessment };
