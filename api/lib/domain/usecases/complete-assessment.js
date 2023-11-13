import { AssessmentCompleted } from '../events/AssessmentCompleted.js';
import { CampaignParticipationStatuses } from '../models/CampaignParticipationStatuses.js';
import { AlreadyRatedAssessmentError } from '../errors.js';

const completeAssessment = async function ({
  assessmentId,
  domainTransaction,
  campaignParticipationRepository,
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

    await campaignParticipationRepository.update(
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
