import { CampaignParticipationStatuses } from '../../../src/prescription/shared/domain/constants.js';
import { AlreadyRatedAssessmentError } from '../errors.js';
import { AssessmentCompleted } from '../events/AssessmentCompleted.js';

const completeAssessment = async function ({
  assessmentId,
  campaignParticipationBCRepository,
  assessmentRepository,
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
