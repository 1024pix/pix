const SimulationResult = require('../models/SimulationResult');

module.exports = async function simulateOldScoring({ challengeRepository, simulations }) {
  const challenges = await challengeRepository.findValidated();
  const challengesById = new Map(challenges.map((challenge) => [challenge.id, challenge]));

  const simulationResults = simulations.map(({ answers }) => {
    const scoreBySkillId = {};

    for (const answer of answers) {
      const challenge = challengesById.get(answer.challengeId);

      if (answer.isOk()) {
        scoreBySkillId[challenge.skill.id] = challenge.skill.pixValue;
      }
    }

    const pixScore = Object.values(scoreBySkillId).reduce((sum, pixValue) => sum + pixValue, 0);

    return new SimulationResult({ pixScore });
  });

  return simulationResults;
};
