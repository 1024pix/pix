const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = async ({ authenticatedUserId, requestedUserId, smartPlacementKnowledgeElementRepository }) => {

  if (authenticatedUserId !== requestedUserId) {
    throw new UserNotAuthorizedToAccessEntity();
  }

  const userPixScore = await smartPlacementKnowledgeElementRepository.getSumOfPixFromUserKnowledgeElements(requestedUserId);
  return { id: requestedUserId, value: userPixScore };
};
