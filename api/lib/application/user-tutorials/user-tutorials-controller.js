import usecases from '../../domain/usecases';
import userSavedTutorialSerializer from '../../infrastructure/serializers/jsonapi/user-saved-tutorial-serializer';
import tutorialSerializer from '../../infrastructure/serializers/jsonapi/tutorial-serializer';
import userSavedTutorialRepository from '../../infrastructure/repositories/user-saved-tutorial-repository';
import queryParamsUtils from '../../infrastructure/utils/query-params-utils';
import requestResponseUtils from '../../infrastructure/utils/request-response-utils';

export default {
  async add(request, h) {
    const { userId } = request.auth.credentials;
    const { tutorialId } = request.params;
    const userSavedTutorial = userSavedTutorialSerializer.deserialize(request.payload);

    const createdUserSavedTutorial = await usecases.addTutorialToUser({ ...userSavedTutorial, userId, tutorialId });

    return h.response(userSavedTutorialSerializer.serialize(createdUserSavedTutorial)).created();
  },

  async find(request) {
    const { userId } = request.auth.credentials;
    const { page, filter: filters } = queryParamsUtils.extractParameters(request.query);
    const locale = requestResponseUtils.extractLocaleFromRequest(request);
    const { tutorials, meta } = await usecases.findPaginatedFilteredTutorials({
      userId,
      filters,
      page,
      locale,
    });
    return tutorialSerializer.serialize(tutorials, meta);
  },

  async removeFromUser(request, h) {
    const { userId } = request.auth.credentials;
    const { tutorialId } = request.params;

    await userSavedTutorialRepository.removeFromUser({ userId, tutorialId });

    return h.response().code(204);
  },
};
