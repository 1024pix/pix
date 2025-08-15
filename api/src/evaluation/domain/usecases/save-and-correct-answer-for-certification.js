import { withTransaction } from '../../../shared/domain/DomainTransaction.js';
import {
  CertificationEndedByFinalizationError,
  CertificationEndedBySupervisorError,
  ChallengeAlreadyAnsweredError,
  ForbiddenAccess,
} from '../../../shared/domain/errors.js';
import { ChallengeNotAskedError } from '../../../shared/domain/errors.js';
import { EmptyAnswerError } from '../errors.js';

import * as injectedCorrectionService from '../services/correction-service.js';
import * as injectedCertificationEvaluationCandidateRepository from '../../../certification/evaluation/infrastructure/repositories/certification-candidate-repository.js';
import * as injectedCertificationChallengeLiveAlertRepository from '../../../certification/shared/infrastructure/repositories/certification-challenge-live-alert-repository.js';
import * as injectedChallengeRepository from '../../../shared/infrastructure/repositories/challenge-repository.js';
import * as injectedAnswerRepository from '../../../shared/infrastructure/repositories/answer-repository.js';

const saveAndCorrectAnswerForCertification = withTransaction(async function ({
  answer,
  userId,
  assessment,
  forceOKAnswer = false,
  answerRepository = injectedAnswerRepository,
  challengeRepository = injectedChallengeRepository,
  certificationChallengeLiveAlertRepository = injectedCertificationChallengeLiveAlertRepository,
  certificationEvaluationCandidateRepository = injectedCertificationEvaluationCandidateRepository,
  correctionService = injectedCorrectionService,
} = {}) {
  if (assessment.userId !== userId) {
    throw new ForbiddenAccess('User is not allowed to add an answer for this assessment.');
  }
  if (assessment.isEndedBySupervisor()) {
    throw new CertificationEndedBySupervisorError();
  }
  if (assessment.hasBeenEndedDueToFinalization()) {
    throw new CertificationEndedByFinalizationError();
  }
  if (assessment.answers.some((existingAnswer) => existingAnswer.challengeId === answer.challengeId)) {
    throw new ChallengeAlreadyAnsweredError();
  }
  if (assessment.lastChallengeId && assessment.lastChallengeId != answer.challengeId) {
    throw new ChallengeNotAskedError();
  }
  if (!answer.hasValue && !answer.hasTimedOut) {
    throw new EmptyAnswerError();
  }

  const challenge = await challengeRepository.get(answer.challengeId);
  const ongoingOrValidatedCertificationChallengeLiveAlert =
    await certificationChallengeLiveAlertRepository.getOngoingOrValidatedByChallengeIdAndAssessmentId({
      challengeId: challenge.id,
      assessmentId: assessment.id,
    });

  if (ongoingOrValidatedCertificationChallengeLiveAlert) {
    throw new ForbiddenAccess('An alert has been set.');
  }

  const certificationCandidate = await certificationEvaluationCandidateRepository.findByAssessmentId({
    assessmentId: assessment.id,
  });
  const correctedAnswer = correctionService.evaluateAnswer({
    challenge,
    answer,
    assessment,
    accessibilityAdjustmentNeeded: certificationCandidate.accessibilityAdjustmentNeeded,
    forceOKAnswer,
  });
  const now = new Date();
  const lastQuestionDate = assessment.lastQuestionDate || now;
  correctedAnswer.setTimeSpentFrom({ now, lastQuestionDate });

  const answerSaved = await answerRepository.save({ answer: correctedAnswer });
  answerSaved.levelup = {};

  return answerSaved;
});

export { saveAndCorrectAnswerForCertification };
