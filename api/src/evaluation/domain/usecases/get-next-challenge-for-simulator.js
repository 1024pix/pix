import { STEPS_NAMES } from '../models/SmartRandomStep.js';

/**
 * @param {simulationParameters: SimulationParameters} simulationParameters
 * @param pickChallengeService
 * @param smartRandomService
 * @returns {Promise<{challenge: Challenge, smartRandomDetails: SmartRandomDetails} | null>}
 */
const getNextChallengeForSimulator = function ({ simulationParameters, pickChallengeService, smartRandomService }) {
  const { possibleSkillsForNextChallenge, hasAssessmentEnded, smartRandomDetails } =
    smartRandomService.getPossibleSkillsForNextChallenge({
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
    return null;
  }

  const challenge = pickChallengeService.pickChallenge({
    skills: possibleSkillsForNextChallenge,
    randomSeed: simulationParameters.assessmentId,
    locale: simulationParameters.locale,
  });

  smartRandomDetails.addStep(STEPS_NAMES.RANDOM_PICK, [challenge.skill]);

  return { challenge, smartRandomDetails };
};

export { getNextChallengeForSimulator };
