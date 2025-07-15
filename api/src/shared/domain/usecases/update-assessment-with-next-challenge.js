import { ChallengeToPlay } from '../models/ChallengeToPlay.js';

export async function updateAssessmentWithNextChallenge({
  assessment,
  userId,
  locale,
  assessmentRepository,
  challengeRepository,
  evaluationUsecases,
  certificationEvaluationRepository,
  challengesAPI,
}) {
  if (!assessment.isStarted()) {
    assessment.nextChallenge = null;
    return assessment;
  }
  await assessmentRepository.updateLastQuestionDate({ id: assessment.id, lastQuestionDate: new Date() });

  let nextChallenge = null;
  let waitingForLatestChallengeAnswer;
  if (assessment.isCertification()) {
    // Force executing the usecase because of the live alert system
    waitingForLatestChallengeAnswer = false;
  } else {
    waitingForLatestChallengeAnswer = checkIfLatestChallengeOfAssessmentIsAwaitingToBeAnswered({
      answers: assessment.answers,
      lastChallengeId: assessment.lastChallengeId,
    });
  }
  if (waitingForLatestChallengeAnswer) {
    nextChallenge = await challengeRepository.get(assessment.lastChallengeId);
    if (nextChallenge.isOperative) {
      assessment.nextChallenge = new ChallengeToPlay(nextChallenge);
      return assessment;
    } else {
      nextChallenge = null;
    }
  }

  try {
    if (assessment.isCertification()) {
      nextChallenge = await certificationEvaluationRepository.selectNextCertificationChallenge({
        assessmentId: assessment.id,
        locale,
      });
      nextChallenge = new ChallengeToPlay(nextChallenge);
    }

    if (assessment.isPreview()) {
      nextChallenge = await evaluationUsecases.getNextChallengeForPreview({});
      nextChallenge = new ChallengeToPlay(nextChallenge);
    }

    if (assessment.isDemo()) {
      nextChallenge = await evaluationUsecases.getNextChallengeForDemo({ assessment });
      nextChallenge = new ChallengeToPlay(nextChallenge);
    }

    if (assessment.isForCampaign()) {
      const nextChallengeId = await evaluationUsecases.getNextChallengeForCampaignAssessment({ assessment, locale });
      const challengeDto = await challengesAPI.get(nextChallengeId);
      const webComponentInfoDto = await challengesAPI.getWebComponentInfoFor(challengeDto.id);
      nextChallenge = ChallengeToPlay.fromLearningContentApiDtos(challengeDto, webComponentInfoDto);
    }
    if (assessment.isCompetenceEvaluation()) {
      const nextChallengeId = await evaluationUsecases.getNextChallengeForCompetenceEvaluation({
        assessment,
        userId,
        locale,
      });
      const challengeDto = await challengesAPI.get(nextChallengeId);
      const webComponentInfoDto = await challengesAPI.getWebComponentInfoFor(challengeDto.id);
      nextChallenge = ChallengeToPlay.fromLearningContentApiDtos(challengeDto, webComponentInfoDto);
    }
  } catch {
    nextChallenge = null;
  }

  if (nextChallenge && nextChallenge.id !== assessment.lastChallengeId) {
    await assessmentRepository.updateWhenNewChallengeIsAsked({
      id: assessment.id,
      lastChallengeId: nextChallenge.id,
    });
  }
  assessment.nextChallenge = nextChallenge;

  return assessment;
}

function checkIfLatestChallengeOfAssessmentIsAwaitingToBeAnswered({ answers, lastChallengeId }) {
  if (!lastChallengeId) {
    return false;
  }
  return !answers.some((answer) => answer.challengeId === lastChallengeId);
}
