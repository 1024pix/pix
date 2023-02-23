const ScoringSimulationResult = require('../models/ScoringSimulationResult.js');
const fp = require('lodash/fp');
const { sortBy } = require('lodash');

module.exports = async function simulateOldScoring({ challengeRepository, simulations }) {
  const challenges = await challengeRepository.findOperative();
  const challengesById = new Map(challenges.map((challenge) => [challenge.id, challenge]));

  // prettier-ignore
  const skillsByTubeId = fp.flow(
    fp.map('skill'),
    fp.uniqBy('id'),
    fp.groupBy('tubeId'),
  )(challenges);

  const simulationResults = simulations.map(({ id, answers }) => {
    let pixScore = 0;
    const scoredSkillIds = new Set();
    const scoreByCompetenceId = {};

    const isSkillAnswered = (skill) => scoredSkillIds.has(skill.id);

    for (const answer of answers) {
      const { skill: answeredSkill } = challengesById.get(answer.challengeId);

      if (isSkillAnswered(answeredSkill)) {
        return new ScoringSimulationResult({
          id,
          error: `Answer for skill ${answeredSkill.id} was already given or inferred`,
        });
      }

      const { competenceId, tubeId } = answeredSkill;

      if (scoreByCompetenceId[competenceId] === undefined) {
        scoreByCompetenceId[competenceId] = 0;
      }

      const unscoredTubeSkills = skillsByTubeId[tubeId].filter((skill) => !isSkillAnswered(skill));

      if (answer.isOk()) {
        const succeededSkills = unscoredTubeSkills.filter((skill) => skill.difficulty <= answeredSkill.difficulty);

        for (const succeededSkill of succeededSkills) {
          pixScore += succeededSkill.pixValue;
          scoreByCompetenceId[competenceId] += succeededSkill.pixValue;
          scoredSkillIds.add(succeededSkill.id);
        }
      } else {
        const failedSkills = unscoredTubeSkills.filter((skill) => skill.difficulty >= answeredSkill.difficulty);

        for (const failedSkill of failedSkills) {
          scoredSkillIds.add(failedSkill.id);
        }
      }
    }

    const pixScoreByCompetence = sortBy(
      Object.entries(scoreByCompetenceId).map(([competenceId, pixScore]) => ({
        competenceId,
        pixScore,
      })),
      'competenceId'
    );

    return new ScoringSimulationResult({ id, pixScore, pixScoreByCompetence });
  });

  return simulationResults;
};
