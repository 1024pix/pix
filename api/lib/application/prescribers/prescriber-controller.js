const prescriberSerializer = require('../../infrastructure/serializers/jsonapi/prescriber-serializer.js');

const usecases = require('../../domain/usecases/index.js');

module.exports = {
  get(request, h, dependencies = { prescriberSerializer }) {
    const authenticatedUserId = request.auth.credentials.userId;

    return usecases
      .getPrescriber({ userId: authenticatedUserId })
      .then((prescriber) => dependencies.prescriberSerializer.serialize(prescriber));
  },
};
