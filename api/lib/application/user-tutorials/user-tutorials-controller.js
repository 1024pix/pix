const usecases = require('../../domain/usecases');
const userTutorialSerializer = require('../../infrastructure/serializers/jsonapi/user-tutorial-serializer');

module.exports = {

  async addToUser(request, h) {
    const { userId } = request.auth.credentials;
    const { tutorialId } = request.params;

    await usecases.addTutorialToUser({ userId, tutorialId });

    return h.response(userTutorialSerializer.serialize({ userId, tutorialId })).created();
  },

};
