const AssessmentCompleted = require('../events/AssessmentCompleted');
const CampaignParticipationStatuses = require('../models/CampaignParticipationStatuses');

const { AlreadyRatedAssessmentError } = require('../errors');

module.exports = async function completeAssessment({
  assessmentId,
  domainTransaction,
  campaignParticipationRepository,
  assessmentRepository,
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
      domainTransaction
    );
  }

  return new AssessmentCompleted({
    assessmentId: assessment.id,
    userId: assessment.userId,
    campaignParticipationId: assessment.campaignParticipationId,
    certificationCourseId: assessment.certificationCourseId,
  });
};
