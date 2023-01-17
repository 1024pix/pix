const SimulationResult = require('../models/SimulationResult');

module.exports = async function simulateFlashScoring({
  challengeRepository,
  flashAlgorithmService,
  successProbabilityThreshold,
  simulations,
  locale = 'fr',
}) {
  const challenges = await challengeRepository.findFlashCompatible({ locale, successProbabilityThreshold });
  const challengeIds = new Set(challenges.map(({ id }) => id));

  return simulations.map(({ id, estimatedLevel, answers: allAnswers }) => {
    if (estimatedLevel == undefined) {
      return new SimulationResult({
        id,
        error: 'Simulation should have an estimated level',
      });
    }

    for (const answer of allAnswers) {
      if (!challengeIds.has(answer.challengeId)) {
        return new SimulationResult({
          id,
          error: `Challenge ID ${answer.challengeId} is unknown or not compatible with flash algorithm`,
        });
      }
    }

    const pixScore = flashAlgorithmService.calculateTotalPixScore({
      challenges,
      estimatedLevel,
      allAnswers,
    });

    return new SimulationResult({ id, estimatedLevel, pixScore });
  });
};
