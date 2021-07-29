const usecases = require('../../domain/usecases');
const userSerializer = require('../../infrastructure/serializers/jsonapi/user-serializer');
const studentInformationForAccountRecoverySerializer = require('../../infrastructure/serializers/jsonapi/student-information-for-account-recovery-serializer');
const DomainTransaction = require('../../infrastructure/DomainTransaction');

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

  async updateUserAccountRecovery(request, h) {

    const userId = request.payload.data.id;
    const email = request.payload.data.attributes.email;
    const password = request.payload.data.attributes.password;
    const temporaryKey = request.payload.data.attributes['temporary-key'];

    await DomainTransaction.execute(async (domainTransaction) => {
      await usecases.updateUserAccount({
        userId,
        newEmail: email,
        password,
        temporaryKey,
        domainTransaction,
      },
      );
    });

    return h.response().code(204);
  },

};
