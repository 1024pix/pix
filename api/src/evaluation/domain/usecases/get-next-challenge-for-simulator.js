/**
 * @param {simulationParameters: SimulationParameters} simulationParameters
 * @param pickChallengeService
 * @param smartRandomService
 * @returns {Promise<Challenge | null>}
 */
const getNextChallengeForSimulator = function ({ simulationParameters, pickChallengeService, smartRandomService }) {
  const { possibleSkillsForNextChallenge, hasAssessmentEnded } = smartRandomService.getPossibleSkillsForNextChallenge({
    knowledgeElements: simulationParameters.knowledgeElements,
    challenges: simulationParameters.challenges,
    locale: simulationParameters.locale,
    targetSkills: simulationParameters.skills,
    allAnswers: simulationParameters.answers,
  });

  if (hasAssessmentEnded) {
    return null;
  }

  return pickChallengeService.pickChallenge({
    skills: possibleSkillsForNextChallenge,
    randomSeed: simulationParameters.assessmentId,
    locale: simulationParameters.locale,
  });
};

export { getNextChallengeForSimulator };
