const _ = require('lodash');
const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = async ({ authenticatedUserId, requestedUserId, smartPlacementKnowledgeElementRepository }) => {

  if (authenticatedUserId !== requestedUserId) {
    return Promise.reject(new UserNotAuthorizedToAccessEntity());
  }

  const userKnowledgeElements = await smartPlacementKnowledgeElementRepository.findUniqByUserId(requestedUserId);
  return { pixScore: _.sumBy(userKnowledgeElements, 'earnedPix') };
};
