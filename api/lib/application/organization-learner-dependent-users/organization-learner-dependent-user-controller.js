const usecases = require('../../domain/usecases');
const studentInformationForAccountRecoverySerializer = require('../../infrastructure/serializers/jsonapi/student-information-for-account-recovery-serializer');

module.exports = {
  async checkScoAccountRecovery(request) {
    const studentInformation = await studentInformationForAccountRecoverySerializer.deserialize(request.payload);

    const studentInformationForAccountRecovery = await usecases.checkScoAccountRecovery({
      studentInformation,
    });

    return studentInformationForAccountRecoverySerializer.serialize(studentInformationForAccountRecovery);
  },
};
