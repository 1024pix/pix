const _ = require('lodash');
const { UserNotAuthorizedToAccessEntity } = require('../errors');

const CURRENT_USER_MAX_LEVEL  = 5;
const NB_PIX_BY_LEVEL         = 8;

module.exports = async ({ authenticatedUserId, requestedUserId, smartPlacementKnowledgeElementRepository, competenceRepository }) => {

  if (authenticatedUserId !== requestedUserId) {
    return Promise.reject(new UserNotAuthorizedToAccessEntity());
  }
  const userKE = await smartPlacementKnowledgeElementRepository.findUniqByUserId(requestedUserId);
  const sortedKEGroupedByCompetence = _.groupBy(userKE, 'competenceId');

  const competenceTree = await competenceRepository.list();
  return _.map(competenceTree, (competence) => {
    const KEgroup = sortedKEGroupedByCompetence[competence.id];

    competence.earnedPix = _.sumBy(KEgroup, 'earnedPix');
    competence.level = _getUserLevel(competence.earnedPix);
    competence.pixScoreAheadOfNextLevel = _getPixScoreAheadOfNextLevel(competence.earnedPix);

    return competence;
  });
};

function _getUserLevel(pix) {
  const userLevel = Math.floor(pix / NB_PIX_BY_LEVEL);
  return (userLevel >= CURRENT_USER_MAX_LEVEL) ? CURRENT_USER_MAX_LEVEL : userLevel;
}

function _getPixScoreAheadOfNextLevel(pix) {
  return pix % NB_PIX_BY_LEVEL;
}
