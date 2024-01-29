import { AssessmentEndedError, UserNotAuthorizedToAccessEntityError } from '../errors.js';
import * as algorithmDataFetcherService from '../services/algorithm-methods/data-fetcher.js';

const getNextChallengeForCompetenceEvaluation = async function ({
  pickChallengeService,
  assessment,
  userId,
  locale,
  smartRandom,
}) {
  _checkIfAssessmentBelongsToUser(assessment, userId);
  const inputValues = await algorithmDataFetcherService.fetchForCompetenceEvaluations(...arguments);

  console.info(`L'utilisateur ${userId} a ${inputValues.knowledgeElements.length} ke`);

  console.info(`Tous les ${inputValues.targetSkills.length} acquis de la compétence: `);

  console.info(inputValues.targetSkills.map(({ name, difficulty }) => ({ name, difficulty })));

  console.info(`Tous les ${inputValues.challenges.length} challenges de la compétence: `);

  console.info(inputValues.challenges.map(({ id, skill }) => ({ id, skill: skill.name })));

  const { possibleSkillsForNextChallenge, hasAssessmentEnded } = smartRandom.getPossibleSkillsForNextChallenge({
    ...inputValues,
    locale,
  });

  if (hasAssessmentEnded) {
    throw new AssessmentEndedError();
  }

  return pickChallengeService.pickChallenge({
    skills: possibleSkillsForNextChallenge,
    randomSeed: assessment.id,
    locale: locale,
  });
};

export { getNextChallengeForCompetenceEvaluation };

function _checkIfAssessmentBelongsToUser(assessment, userId) {
  if (assessment.userId !== userId) {
    throw new UserNotAuthorizedToAccessEntityError();
  }
}
