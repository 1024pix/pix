const prescriberSerializer = require('../../infrastructure/serializers/jsonapi/prescriber-serializer');

const usecases = require('../../domain/usecases/index.js');

module.exports = {
  get(request) {
    const authenticatedUserId = request.auth.credentials.userId;

    return usecases
      .getPrescriber({ userId: authenticatedUserId })
      .then((prescriber) => prescriberSerializer.serialize(prescriber));
  },
};
