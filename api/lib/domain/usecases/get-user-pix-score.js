const _ = require('lodash');

module.exports = async function getUserPixScore({ userId, competenceRepository }) {
  const competenceScores = await competenceRepository.getPixScoreByCompetence({ userId });
  const userPixScore = _.sum(_.values(competenceScores));
  return { id: userId, value: userPixScore };
};
