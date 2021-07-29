const usecases = require('../../domain/usecases');
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
    const studentInformation = await usecases.getAccountRecoveryDetails({ temporaryKey });
    return studentInformationForAccountRecoverySerializer.serializeAccountRecovery(studentInformation);
  },

  async updateUserAccountFromRecoveryDemand(request, h) {
    const temporaryKey = request.payload.data.attributes['temporary-key'];
    const password = request.payload.data.attributes.password;

    await DomainTransaction.execute(async (domainTransaction) => {
      await usecases.updateUserAccount({
        password,
        temporaryKey,
        domainTransaction,
      },
      );
    });

    return h.response().code(204);
  },

};
