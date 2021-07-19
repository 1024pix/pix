const usecases = require('../../domain/usecases');
const userSerializer = require('../../infrastructure/serializers/jsonapi/user-serializer');
const studentInformationForAccountRecoverySerializer = require('../../infrastructure/serializers/jsonapi/student-information-for-account-recovery-serializer');

module.exports = {

  async sendEmailForAccountRecovery(request, h) {
    const studentInformation = await studentInformationForAccountRecoverySerializer.deserialize(request.payload);

    await usecases.sendEmailForAccountRecovery({ studentInformation });

    return h.response().code(204);
  },

  async checkAccountRecoveryDemand(request) {
    const temporaryKey = request.params.temporaryKey;
    const user = await usecases.getUserByAccountRecoveryDemand({ temporaryKey });
    return userSerializer.serialize(user);
  },

};
