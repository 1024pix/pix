const ScoringSimulationResult = require('../models/ScoringSimulationResult');

module.exports = async function simulateFlashScoring({
  challengeRepository,
  flashAlgorithmService,
  simulations,
  locale,
  context: { calculateEstimatedLevel, successProbabilityThreshold },
}) {
  const challenges = await challengeRepository.findFlashCompatible({ locale, successProbabilityThreshold });
  const challengeIds = new Set(challenges.map(({ id }) => id));

  return simulations.map(({ id, user: { estimatedLevel: givenEstimatedLevel }, answers: allAnswers }) => {
    let finalEstimatedLevel = givenEstimatedLevel;

    if (!calculateEstimatedLevel && givenEstimatedLevel == undefined) {
      return new ScoringSimulationResult({
        id,
        error: 'Simulation should have an estimated level',
      });
    }

    for (const answer of allAnswers) {
      if (!challengeIds.has(answer.challengeId)) {
        return new ScoringSimulationResult({
          id,
          error: `Challenge ID ${answer.challengeId} is unknown or not compatible with flash algorithm`,
        });
      }
    }

    if (calculateEstimatedLevel) {
      if (allAnswers.length === 0) {
        return new ScoringSimulationResult({
          id,
          error: 'Simulation should have answers in order to calculate estimated level',
        });
      }

      const { estimatedLevel: calculatedEstimatedLevel } = flashAlgorithmService.getEstimatedLevelAndErrorRate({
        allAnswers,
        challenges,
      });

      if (givenEstimatedLevel != undefined && calculatedEstimatedLevel !== givenEstimatedLevel) {
        return new ScoringSimulationResult({
          id,
          estimatedLevel: calculatedEstimatedLevel,
          error: `Calculated estimated level ${calculatedEstimatedLevel} is different from expected given estimated level ${givenEstimatedLevel}`,
        });
      }

      finalEstimatedLevel = calculatedEstimatedLevel;
    }

    const { pixScore } = flashAlgorithmService.calculateTotalPixScore({
      challenges,
      estimatedLevel: finalEstimatedLevel,
      allAnswers,
    });

    return new ScoringSimulationResult({ id, estimatedLevel: finalEstimatedLevel, pixScore });
  });
};

// "results": [
//   {
//     "id": "simulation1",
//     "pixScore": 11111,
//     "estimatedLevel": -2.5769829347,
//     "pixScoreByCompetence": [
//       {
//         "competenceId": "competence1",
//         "pixScore": 11100
//       },
//       {
//         "competenceId": "competence2",
//         "pixScore": 11
//       }
//     ],
//     "error": undefined
//   },
// }
