import { getBaseLocale } from '../../../shared/domain/services/locale-service.js';
import { getUserLocale } from '../../../shared/infrastructure/utils/request-response-utils.js';
import { usecases } from '../../domain/usecases/index.js';
import * as userSavedTutorialRepository from '../../infrastructure/repositories/user-saved-tutorial-repository.js';
import { tutorialSerializer } from '../../infrastructure/serializers/jsonapi/tutorial-serializer.js';
import { userSavedTutorialSerializer } from '../../infrastructure/serializers/jsonapi/user-saved-tutorial-serializer.js';

const add = async function (request, h, dependencies = { userSavedTutorialSerializer }) {
  const { userId } = request.auth.credentials;
  const { tutorialId } = request.params;
  const userSavedTutorial = dependencies.userSavedTutorialSerializer.deserialize(request.payload);

  const createdUserSavedTutorial = await usecases.addTutorialToUser({ ...userSavedTutorial, userId, tutorialId });

  return h.response(dependencies.userSavedTutorialSerializer.serialize(createdUserSavedTutorial)).created();
};

const find = async function (request, h, dependencies = { tutorialSerializer }) {
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
  return dependencies.tutorialSerializer.serialize(tutorials, meta);
};

const removeFromUser = async function (request, h, dependencies = { userSavedTutorialRepository }) {
  const { userId } = request.auth.credentials;
  const { tutorialId } = request.params;

  await dependencies.userSavedTutorialRepository.removeFromUser({ userId, tutorialId });

  return h.response().code(204);
};

const userTutorialsController = { add, find, removeFromUser };
export { userTutorialsController };
