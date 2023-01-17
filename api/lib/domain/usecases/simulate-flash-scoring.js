const SimulationResult = require('../models/SimulationResult');

module.exports = async function simulateFlashScoring({
  challengeRepository,
  flashAlgorithmService,
  successProbabilityThreshold,
  simulations,
  calculateEstimatedLevel = false,
  locale = 'fr',
}) {
  const challenges = await challengeRepository.findFlashCompatible({ locale, successProbabilityThreshold });
  const challengeIds = new Set(challenges.map(({ id }) => id));

  return simulations.map(({ id, estimatedLevel: givenEstimatedLevel, answers: allAnswers }) => {
    let finalEstimatedLevel = givenEstimatedLevel;

    if (!calculateEstimatedLevel && givenEstimatedLevel == undefined) {
      return new SimulationResult({
        id,
        error: 'Simulation should have an estimated level',
      });
    }

    if (calculateEstimatedLevel) {
      if (!allAnswers || allAnswers.length === 0) {
        return new SimulationResult({
          id,
          error: 'Simulation should have answers in order to calculate estimated level',
        });
      }

      const { estimatedLevel: calculatedEstimatedLevel } = flashAlgorithmService.getEstimatedLevelAndErrorRate({
        allAnswers,
        challenges,
      });
      finalEstimatedLevel = calculatedEstimatedLevel;
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
      estimatedLevel: finalEstimatedLevel,
      allAnswers,
    });

    return new SimulationResult({ id, estimatedLevel: finalEstimatedLevel, pixScore });
  });
};
