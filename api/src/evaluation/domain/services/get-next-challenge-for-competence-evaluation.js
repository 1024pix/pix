import { AssessmentEndedError } from '../../../shared/domain/errors.js';

export async function getNextChallengeForCompetenceEvaluation({
  assessment,
  locale,
  pickChallengeService,
  smartRandomService,
  algorithmDataFetcherService,
  answerRepository,
  smartRandomChallengeRepository,
  knowledgeStateRepository,
  skillRepository,
  improvementService,
}) {
  const inputValues = await algorithmDataFetcherService.fetchForCompetenceEvaluations({
    assessment,
    locale,
    answerRepository,
    smartRandomChallengeRepository,
    knowledgeStateRepository,
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
  return smartRandomChallenge.id;
}
