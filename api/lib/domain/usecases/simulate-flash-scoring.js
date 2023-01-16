const SimulationResult = require('../models/SimulationResult');

module.exports = async function simulateNewScoring({
  challengeRepository,
  flashAlgorithmService,
  simulations,
  locale = 'fr',
}) {
  const challenges = await challengeRepository.findFlashCompatible({ locale });
  const challengeIds = new Set(challenges.map(({ id }) => id));

  return simulations.map(({ estimatedLevel, answers: allAnswers }) => {
    for (const answer of allAnswers) {
      if (!challengeIds.has(answer.challengeId)) {
        return new SimulationResult({
          error: `Challenge ID ${answer.challengeId} is unknown or not compatible with flash algorithm`,
        });
      }
    }

    const pixScore = flashAlgorithmService.calculateTotalPixScore({
      challenges,
      estimatedLevel,
      allAnswers,
    });

    return new SimulationResult({ estimatedLevel, pixScore });
  });
};
