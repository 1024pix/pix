const usecases = require('../../domain/usecases');
const userTutorialSerializer = require('../../infrastructure/serializers/jsonapi/user-tutorial-serializer');
const tutorialSerializer = require('../../infrastructure/serializers/jsonapi/tutorial-serializer');
const userSavedTutorialRepository = require('../../infrastructure/repositories/user-saved-tutorial-repository');
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
    const { page, filter: filters } = queryParamsUtils.extractParameters(request.query);

    const userPaginatedSavedTutorials = await usecases.findPaginatedFilteredSavedTutorials({ userId, filters, page });

    return h.response(
      tutorialSerializer.serialize(userPaginatedSavedTutorials.results, userPaginatedSavedTutorials.meta)
    );
  },

  async findRecommended(request, h) {
    const { userId } = request.auth.credentials;
    const { page, filter: filters } = queryParamsUtils.extractParameters(request.query);
    const locale = extractLocaleFromRequest(request);
    const userRecommendedTutorials = await usecases.findPaginatedFilteredRecommendedTutorials({
      userId,
      filters,
      page,
      locale,
    });

    return h.response(
      tutorialSerializer.serialize(userRecommendedTutorials.results, userRecommendedTutorials.pagination)
    );
  },

  async removeFromUser(request, h) {
    const { userId } = request.auth.credentials;
    const { tutorialId } = request.params;

    await userSavedTutorialRepository.removeFromUser({ userId, tutorialId });

    return h.response().code(204);
  },
};
