const usecases = require('../../domain/usecases/index.js');
const userSavedTutorialSerializer = require('../../infrastructure/serializers/jsonapi/user-saved-tutorial-serializer.js');
const tutorialSerializer = require('../../infrastructure/serializers/jsonapi/tutorial-serializer.js');
const userSavedTutorialRepository = require('../../infrastructure/repositories/user-saved-tutorial-repository.js');
const queryParamsUtils = require('../../infrastructure/utils/query-params-utils.js');
const requestResponseUtils = require('../../infrastructure/utils/request-response-utils.js');

module.exports = {
  async add(request, h, dependencies = { userSavedTutorialSerializer }) {
    const { userId } = request.auth.credentials;
    const { tutorialId } = request.params;
    const userSavedTutorial = dependencies.userSavedTutorialSerializer.deserialize(request.payload);

    const createdUserSavedTutorial = await usecases.addTutorialToUser({ ...userSavedTutorial, userId, tutorialId });

    return h.response(dependencies.userSavedTutorialSerializer.serialize(createdUserSavedTutorial)).created();
  },

  async find(request, h, dependencies = { queryParamsUtils, requestResponseUtils, tutorialSerializer }) {
    const { userId } = request.auth.credentials;
    const { page, filter: filters } = dependencies.queryParamsUtils.extractParameters(request.query);
    const locale = dependencies.requestResponseUtils.extractLocaleFromRequest(request);
    const { tutorials, meta } = await usecases.findPaginatedFilteredTutorials({
      userId,
      filters,
      page,
      locale,
    });
    return dependencies.tutorialSerializer.serialize(tutorials, meta);
  },

  async removeFromUser(request, h, dependencies = { userSavedTutorialRepository }) {
    const { userId } = request.auth.credentials;
    const { tutorialId } = request.params;

    await dependencies.userSavedTutorialRepository.removeFromUser({ userId, tutorialId });

    return h.response().code(204);
  },
};
