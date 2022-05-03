const usecases = require('../../domain/usecases');
const userTutorialSerializer = require('../../infrastructure/serializers/jsonapi/user-tutorial-serializer');
const tutorialSerializer = require('../../infrastructure/serializers/jsonapi/tutorial-serializer');
const userTutorialRepository = require('../../infrastructure/repositories/user-tutorial-repository');
const queryParamsUtils = require('../../infrastructure/utils/query-params-utils');
const { extractLocaleFromRequest } = require('../../infrastructure/utils/request-response-utils');

module.exports = {
  async add(request, h) {
    const { userId } = request.auth.credentials;
    const { tutorialId } = request.params;
    const userTutorial = userTutorialSerializer.deserialize(request.payload);

    const userSavedTutorial = await usecases.addTutorialToUser({ ...userTutorial, userId, tutorialId });

    return h.response(userTutorialSerializer.serialize(userSavedTutorial)).created();
  },

  async findSaved(request, h) {
    const { userId } = request.auth.credentials;
    const { page } = queryParamsUtils.extractParameters(request.query);

    const userPaginatedSavedTutorials = await usecases.findPaginatedSavedTutorials({ userId, page });

    return h.response(
      tutorialSerializer.serialize(userPaginatedSavedTutorials.results, userPaginatedSavedTutorials.meta)
    );
  },

  async findRecommended(request, h) {
    const { userId } = request.auth.credentials;
    const { page } = queryParamsUtils.extractParameters(request.query);
    const locale = extractLocaleFromRequest(request);
    const userRecommendedTutorials = await usecases.findPaginatedRecommendedTutorials({ userId, page, locale });

    return h.response(
      tutorialSerializer.serialize(userRecommendedTutorials.results, userRecommendedTutorials.pagination)
    );
  },

  async removeFromUser(request, h) {
    const { userId } = request.auth.credentials;
    const { tutorialId } = request.params;

    await userTutorialRepository.removeFromUser({ userId, tutorialId });

    return h.response().code(204);
  },
};
