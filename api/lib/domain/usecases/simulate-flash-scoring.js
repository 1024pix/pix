const SimulationResult = require('../models/SimulationResult');

module.exports = async function simulateNewScoring({
  challengeRepository,
  flashAlgorithmService,
  simulations,
  locale = 'fr',
}) {
  const challenges = await challengeRepository.findFlashCompatible({ locale });

  return simulations.map(({ estimatedLevel, answers: allAnswers }) => {
    const pixScore = flashAlgorithmService.calculateTotalPixScore({
      challenges,
      estimatedLevel,
      allAnswers,
    });

    return new SimulationResult({ estimatedLevel, pixScore });
  });
};
