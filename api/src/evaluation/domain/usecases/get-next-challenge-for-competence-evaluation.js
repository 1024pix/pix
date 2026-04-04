import { AssessmentEndedError, UserNotAuthorizedToAccessEntityError } from '../../../shared/domain/errors.js';

export async function getNextChallengeForCompetenceEvaluation({
  assessment,
  userId,
  locale,
  pickChallengeService,
  smartRandomService,
  algorithmDataFetcherService,
  challengeRepository,
  answerRepository,
  smartRandomChallengeRepository,
  knowledgeElementRepository,
  skillRepository,
  improvementService,
}) {
  _checkIfAssessmentBelongsToUser(assessment, userId);
  const inputValues = await algorithmDataFetcherService.fetchForCompetenceEvaluations({
    assessment,
    locale,
    answerRepository,
    smartRandomChallengeRepository,
    knowledgeElementRepository,
    skillRepository,
    improvementService,
  });

  const { possibleSkillsForNextChallenge, hasAssessmentEnded } = smartRandomService.getPossibleSkillsForNextChallenge({
    ...inputValues,
    locale,
  });

  if (hasAssessmentEnded) {
    throw new AssessmentEndedError();
  }

  const smartRandomChallenge = pickChallengeService.pickChallenge({
    skills: possibleSkillsForNextChallenge,
    randomSeed: assessment.id,
    locale: locale,
  });
  return challengeRepository.get(smartRandomChallenge.id);
}

function _checkIfAssessmentBelongsToUser(assessment, userId) {
  if (assessment.userId !== userId) {
    throw new UserNotAuthorizedToAccessEntityError();
  }
}
