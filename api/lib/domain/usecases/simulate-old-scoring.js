const SimulationResult = require('../models/SimulationResult');
const fp = require('lodash/fp');

module.exports = async function simulateOldScoring({ challengeRepository, simulations }) {
  const challenges = await challengeRepository.findValidated();
  const challengesById = new Map(challenges.map((challenge) => [challenge.id, challenge]));

  // prettier-ignore
  const skillsByTubeId = fp.flow(
    fp.map('skill'),
    fp.uniqBy('id'),
    fp.groupBy('tubeId'),
  )(challenges);

  const simulationResults = simulations.map(({ answers }) => {
    const scoreBySkillId = {};

    for (const answer of answers) {
      const challenge = challengesById.get(answer.challengeId);

      if (scoreBySkillId[challenge.skill.id] !== undefined) {
        return new SimulationResult({ error: `Answer for skill ${challenge.skill.id} was already given or inferred` });
      }

      const tubeSkills = skillsByTubeId[challenge.skill.tubeId];

      if (answer.isOk()) {
        for (const tubeSkill of tubeSkills) {
          if (tubeSkill.difficulty <= challenge.skill.difficulty) {
            scoreBySkillId[tubeSkill.id] = tubeSkill.pixValue;
          }
        }
      } else {
        for (const tubeSkill of tubeSkills) {
          if (tubeSkill.difficulty >= challenge.skill.difficulty) {
            scoreBySkillId[tubeSkill.id] = 0;
          }
        }
      }
    }

    const pixScore = Object.values(scoreBySkillId).reduce((sum, pixValue) => sum + pixValue, 0);

    return new SimulationResult({ pixScore });
  });

  return simulationResults;
};
