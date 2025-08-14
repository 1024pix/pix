import { STEPS_NAMES } from '../models/SmartRandomStep.js';
import * as injectedSmartRandomService from '../services/algorithm-methods/smart-random.js';
import { pickChallengeService as injectedPickChallengeService } from '../services/pick-challenge-service.js';
import { getSmartRandomLog, logStep } from '../services/smart-random-log-service.js';

/**
 * @param {simulationParameters: SimulationParameters} simulationParameters
 * @param pickChallengeService
 * @param smartRandomService
 * @returns {Promise<{challenge: Challenge | null, smartRandomLog: SmartRandomLog}}
 */
const getNextChallengeForSimulator = function ({
  simulationParameters,
  pickChallengeService = injectedPickChallengeService,
  smartRandomService = injectedSmartRandomService,
} = {}) {
  const { possibleSkillsForNextChallenge, hasAssessmentEnded } = smartRandomService.getPossibleSkillsForNextChallenge({
    knowledgeElements: simulationParameters.knowledgeElements,
    challenges: simulationParameters.challenges,
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

  const challenge = pickChallengeService.pickChallenge({
    skills: possibleSkillsForNextChallenge,
    randomSeed: simulationParameters.assessmentId,
    locale: simulationParameters.locale,
  });

  logStep(STEPS_NAMES.RANDOM_PICK, [challenge.skill]);

  return { challenge, smartRandomLog: getSmartRandomLog() };
};

export { getNextChallengeForSimulator };
