const _ = require('lodash');
const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = async ({ authenticatedUserId, requestedUserId, smartPlacementKnowledgeElementRepository, competenceRepository }) => {

  if (authenticatedUserId !== requestedUserId) {
    return Promise.reject(new UserNotAuthorizedToAccessEntity());
  }
  const userKE = await smartPlacementKnowledgeElementRepository.findUniqByUserId(requestedUserId);
  const sortedKE = _.groupBy(userKE, 'competenceId');

  const competenceTree = await competenceRepository.list();
  return _.map(competenceTree, (competence) => {
    const KEgroup = sortedKE[competence.id];

    competence.earnedPix = _.sumBy(KEgroup, 'earnedPix');
    competence.level = _getUserLevel(competence.earnedPix);
    competence.percentageOnLevel = _getPercentageOnNextLevel(competence.earnedPix);

    return competence;
  });

};

function _getUserLevel(pix) {
  return Math.floor(pix / 8);
}

function _getPercentageOnNextLevel(pix) {
  return ((pix % 8) / 8) * 100;
}
