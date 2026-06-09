import { getBaseLocale } from '../../../shared/domain/services/locale-service.js';
import { getUserLocale } from '../../../shared/infrastructure/utils/request-response-utils.js';
import { usecases } from '../../domain/usecases/index.js';
import * as userSavedTutorialRepository from '../../infrastructure/repositories/user-saved-tutorial-repository.js';
import * as tutorialSerializer from '../../infrastructure/serializers/jsonapi/tutorial-serializer.js';
import * as userSavedTutorialSerializer from '../../infrastructure/serializers/jsonapi/user-saved-tutorial-serializer.js';

const add = async function (request, h) {
  const { userId } = request.auth.credentials;
  const { tutorialId } = request.params;
  const userSavedTutorial = userSavedTutorialSerializer.deserialize(request.payload);

  const createdUserSavedTutorial = await usecases.addTutorialToUser({ ...userSavedTutorial, userId, tutorialId });

  return h.response(userSavedTutorialSerializer.serialize(createdUserSavedTutorial)).created();
};

const find = async function (request) {
  const { userId } = request.auth.credentials;
  const { page, filter: filters } = request.query;
  const locale = getUserLocale(request);
  const lang = getBaseLocale(locale);
  const { tutorials, meta } = await usecases.findPaginatedFilteredTutorials({
    userId,
    filters,
    page,
    lang,
  });
  return tutorialSerializer.serialize(tutorials, meta);
};

const removeFromUser = async function (request, h, dependencies = { userSavedTutorialRepository }) {
  const { userId } = request.auth.credentials;
  const { tutorialId } = request.params;

  await dependencies.userSavedTutorialRepository.removeFromUser({ userId, tutorialId });

  return h.response().code(204);
};

export const userTutorialsController = { add, find, removeFromUser };
