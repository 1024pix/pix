import { AssessmentEndedError } from '../errors.js';

export async function getNextChallenge({
  assessmentId,
  userId,
  locale,
  assessmentRepository,
  answerRepository,
  challengeRepository,
  evaluationUsecases,
  certificationEvaluationRepository,
}) {
  const assessment = await assessmentRepository.get(assessmentId);
  if (!assessment.isStarted()) {
    throw new AssessmentEndedError();
  }
  await assessmentRepository.updateLastQuestionDate({ id: assessment.id, lastQuestionDate: new Date() });

  let nextChallenge = null;

  // Check certification before shortcut with lastChallengeId due to LiveAlert system
  if (assessment.isCertification()) {
    nextChallenge = await certificationEvaluationRepository.selectNextCertificationChallenge({
      assessmentId: assessment.id,
      locale,
    });

    await updateWhenNewChallengeIsAsked({
      assessment,
      challenge: nextChallenge,
      assessmentRepository,
    });

    return nextChallenge;
  }

  const answers = await answerRepository.findByAssessment(assessment.id);
  const waitingForLatestChallengeAnswer = checkIfLatestChallengeOfAssessmentIsAwaitingToBeAnswered({
    answers,
    lastChallengeId: assessment.lastChallengeId,
  });

  if (waitingForLatestChallengeAnswer) {
    nextChallenge = await challengeRepository.get(assessment.lastChallengeId);
    if (nextChallenge.isOperative) {
      return nextChallenge;
    } else {
      nextChallenge = null;
    }
  }

  if (assessment.isPreview()) {
    nextChallenge = await evaluationUsecases.getNextChallengeForPreview({});
  }

  if (assessment.isDemo()) {
    nextChallenge = await evaluationUsecases.getNextChallengeForDemo({ assessment });
  }

  if (assessment.isForCampaign()) {
    nextChallenge = await evaluationUsecases.getNextChallengeForCampaignAssessment({ assessment, locale });
  }

  if (assessment.isCompetenceEvaluation()) {
    nextChallenge = await evaluationUsecases.getNextChallengeForCompetenceEvaluation({ assessment, userId, locale });
  }

  await updateWhenNewChallengeIsAsked({
    assessment,
    challenge: nextChallenge,
    assessmentRepository,
  });

  return nextChallenge;
}

function updateWhenNewChallengeIsAsked({ assessment, challenge, assessmentRepository }) {
  if (challenge && challenge.id !== assessment.lastChallengeId) {
    assessmentRepository.updateWhenNewChallengeIsAsked({
      id: assessment.id,
      lastChallengeId: challenge.id,
    });
  }
}

function checkIfLatestChallengeOfAssessmentIsAwaitingToBeAnswered({ answers, lastChallengeId }) {
  if (!lastChallengeId) {
    return false;
  }
  return !answers.some((answer) => answer.challengeId === lastChallengeId);
}
