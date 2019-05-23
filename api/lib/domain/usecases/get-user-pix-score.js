const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = async ({ authenticatedUserId, requestedUserId, knowledgeElementRepository }) => {

  if (authenticatedUserId !== requestedUserId) {
    throw new UserNotAuthorizedToAccessEntity();
  }

  const userPixScore = await knowledgeElementRepository.getSumOfPixFromUserKnowledgeElements(requestedUserId);
  return { id: requestedUserId, value: userPixScore };
};
