import { ChallengeForSmartRandom } from '../models/ChallengeForSmartRandom.js';
import { STEPS_NAMES } from '../models/SmartRandomStep.js';
import { getSmartRandomLog, logStep } from '../services/smart-random-log-service.js';

/**
 * @param {simulationParameters: SimulationParameters} simulationParameters
 * @param pickChallengeService
 * @param smartRandomService
 * @returns {Promise<{challenge: Challenge | null, smartRandomLog: SmartRandomLog}}
 */
const getNextChallengeForSimulator = function ({ simulationParameters, pickChallengeService, smartRandomService }) {
  const { possibleSkillsForNextChallenge, hasAssessmentEnded } = smartRandomService.getPossibleSkillsForNextChallenge({
    knowledgeElements: simulationParameters.knowledgeElements,
    challenges:
      simulationParameters?.challenges?.map(
        (challenge) =>
          new ChallengeForSmartRandom({
            ...challenge,
            skillId: challenge.skill.id,
          }),
      ) ?? [],
    locale: simulationParameters.locale,
    targetSkills: simulationParameters.skills,
    allAnswers: simulationParameters.answers,
    lastAnswer: simulationParameters.answers.length
      ? simulationParameters.answers[simulationParameters.answers.length - 1]
      : null,
  });

  if (hasAssessmentEnded) {
    return {
      challenge: null,
      smartRandomLog: getSmartRandomLog(),
    };
  }

  const nextChallengeId = pickChallengeService.pickChallenge({
    skills: possibleSkillsForNextChallenge,
    randomSeed: simulationParameters.assessmentId,
    locale: simulationParameters.locale,
  }).id;

  const challenge = simulationParameters.challenges.find((challenge) => challenge.id === nextChallengeId);

  logStep(STEPS_NAMES.RANDOM_PICK, [challenge.skill]);

  return { challenge, smartRandomLog: getSmartRandomLog() };
};

export { getNextChallengeForSimulator };
