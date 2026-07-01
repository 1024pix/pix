import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { EmptyAnswerError, ForbiddenAccess, NotFoundError } from '../../../../shared/domain/errors.js';

export async function evaluateAndSaveAnswer({
  answer,
  userId,
  certificationCourseId,
  forceOKAnswer,
  answerRepository,
  assessmentSheetRepository,
  correctionApi,
  candidateRepository,
  certificationChallengeLiveAlertRepository,
  sharedChallengeRepository,
}) {
  const assessmentSheet = await assessmentSheetRepository.findByCertificationCourseId(certificationCourseId);

  if (!assessmentSheet) {
    throw new NotFoundError(`No certification test found with id ${certificationCourseId}`);
  }

  assessmentSheet.checkIfCandidateCanAnswer({ answer, userId });

  if (!answer.hasValue && !answer.hasTimedOut) {
    throw new EmptyAnswerError();
  }

  const challenge = await sharedChallengeRepository.get(answer.challengeId);
  const ongoingOrValidatedCertificationChallengeLiveAlert =
    await certificationChallengeLiveAlertRepository.getOngoingOrValidatedByChallengeIdAndAssessmentId({
      challengeId: challenge.id,
      assessmentId: assessmentSheet.assessmentId,
    });

  if (ongoingOrValidatedCertificationChallengeLiveAlert) {
    throw new ForbiddenAccess('An alert has been set.');
  }

  const certificationCandidate = await candidateRepository.findByAssessmentId({
    assessmentId: assessmentSheet.assessmentId,
  });
  const correctedAnswer = correctionApi.correctAnswer({
    challenge,
    answer,
    challengeSubmittedAt: assessmentSheet.lastQuestionDate,
    hasChallengeBeenFocusedOut: assessmentSheet.hasLastQuestionBeenFocusedOut(),
    isCertificationEvaluation: true,
    accessibilityAdjustmentNeeded: certificationCandidate.accessibilityAdjustmentNeeded,
    forceOKAnswer,
  });

  return DomainTransaction.execute(async () => {
    const answerSaved = await answerRepository.save({ answer: correctedAnswer });
    assessmentSheet.refreshLastAnswerTimestamp(answerSaved.createdAt);
    await assessmentSheetRepository.update(assessmentSheet);

    answerSaved.levelup = {};
    return answerSaved;
  });
}
