const usecases = require('../../domain/usecases');
const userSerializer = require('../../infrastructure/serializers/jsonapi/user-serializer');

module.exports = {

  async sendEmailForAccountRecovery(request, h) {
    const userId = request.payload.data.attributes['user-id'];
    const email = request.payload.data.attributes.email;

    await usecases.sendEmailForAccountRecovery({ userId, email });

    return h.response().code(204);
  },

  async checkAccountRecoveryDemand(request) {
    const temporaryKey = request.params.temporaryKey;
    const user = await usecases.getUserByAccountRecoveryDemand({ temporaryKey });
    return userSerializer.serialize(user);
  },

};
