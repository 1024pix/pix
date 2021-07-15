const usecases = require('../../domain/usecases');
const userSerializer = require('../../infrastructure/serializers/jsonapi/user-serializer');

module.exports = {

  async sendEmailForAccountRecovery(request, h) {
    const payload = request.payload.data.attributes;
    const studentInformation = {
      nationalStudentId: payload['ine-ina'],
      firstName: payload['first-name'],
      lastName: payload['last-name'],
      birthdate: payload['birthdate'],
      email: payload['email'],
    };

    await usecases.sendEmailForAccountRecovery({ studentInformation });

    return h.response().code(204);
  },

  async checkAccountRecoveryDemand(request) {
    const temporaryKey = request.params.temporaryKey;
    const user = await usecases.getUserByAccountRecoveryDemand({ temporaryKey });
    return userSerializer.serialize(user);
  },

};
