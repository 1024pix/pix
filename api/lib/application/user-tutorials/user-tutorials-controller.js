const usecases = require('../../domain/usecases');
const userTutorialSerializer = require('../../infrastructure/serializers/jsonapi/user-tutorial-serializer');
const userTutorialRepository = require('../../infrastructure/repositories/user-tutorial-repository');

module.exports = {

  async add(request, h) {
    const { userId } = request.auth.credentials;
    const { tutorialId } = request.params;

    const userTutorial = await usecases.addTutorialToUser({ userId, tutorialId });

    return h.response(userTutorialSerializer.serialize(userTutorial)).created();
  },

  async find(request, h) {
    const { userId } = request.auth.credentials;

    const userTutorials = await usecases.findUserTutorials({ userId });

    return h.response(userTutorialSerializer.serialize(userTutorials));
  },

  async removeFromUser(request, h) {
    const { userId } = request.auth.credentials;
    const { tutorialId } = request.params;

    await userTutorialRepository.removeFromUser({ userId, tutorialId });

    return h.response().code(204);
  },

};
