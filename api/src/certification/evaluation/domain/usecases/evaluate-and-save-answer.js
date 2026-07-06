import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { EmptyAnswerError, ForbiddenAccess, NotFoundError } from '../../../../shared/domain/errors.js';
import { CertificationDurationExceededError } from '../errors.js';

export async function evaluateAndSaveAnswer({
  answer,
  userId,
  certificationCourseId,
  forceOKAnswer,
  answerRepository,
  assessmentSheetRepository,
  correctionApi,
  certificationChallengeLiveAlertRepository,
  sharedChallengeRepository,
}) {
  if (answer.isEmpty) {
    throw new EmptyAnswerError();
  }

  const assessmentSheet = await assessmentSheetRepository.findByCertificationCourseId(certificationCourseId);
  if (!assessmentSheet) {
    throw new NotFoundError(`No certification test found with id ${certificationCourseId}`);
  }

  assessmentSheet.checkIfCandidateCanAnswer({ answer, userId });

  if (assessmentSheet.hasCertificationDurationExceeded()) {
    assessmentSheet.endDueToCertificationDurationExceeded();
    await assessmentSheetRepository.update(assessmentSheet);
    throw new CertificationDurationExceededError();
  }

  const hasLiveAlertOnChallenge =
    await certificationChallengeLiveAlertRepository.getOngoingOrValidatedByChallengeIdAndAssessmentId({
      challengeId: answer.challengeId,
      assessmentId: assessmentSheet.assessmentId,
    });
  if (hasLiveAlertOnChallenge) {
    throw new ForbiddenAccess('An alert has been set.');
  }

  const challenge = await sharedChallengeRepository.get(answer.challengeId);
  const correctedAnswer = correctionApi.correctAnswer({
    isCertificationEvaluation: true,
    challenge,
    answer,
    challengeSubmittedAt: assessmentSheet.lastQuestionDate,
    hasChallengeBeenFocusedOut: assessmentSheet.hasLastQuestionBeenFocusedOut(),
    accessibilityAdjustmentNeeded: assessmentSheet.accessibilityAdjustmentNeeded,
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
