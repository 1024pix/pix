const usecases = require('../../domain/usecases');
const organizationLearnerDependentUserSerializer = require('../../infrastructure/serializers/jsonapi/organization-learner-dependent-user-serializer');
const studentInformationForAccountRecoverySerializer = require('../../infrastructure/serializers/jsonapi/student-information-for-account-recovery-serializer');

module.exports = {
  async generateUsernameWithTemporaryPassword(request, h) {
    const payload = request.payload.data.attributes;
    const organizationId = payload['organization-id'];
    const organizationLearnerId = payload['schooling-registration-id'];

    const result = await usecases.generateUsernameWithTemporaryPassword({
      organizationLearnerId,
      organizationId,
    });

    const organizationLearnerWithGeneratedUsernamePasswordResponse =
      organizationLearnerDependentUserSerializer.serialize(result);

    return h.response(organizationLearnerWithGeneratedUsernamePasswordResponse).code(200);
  },

  async checkScoAccountRecovery(request) {
    const studentInformation = await studentInformationForAccountRecoverySerializer.deserialize(request.payload);

    const studentInformationForAccountRecovery = await usecases.checkScoAccountRecovery({
      studentInformation,
    });

    return studentInformationForAccountRecoverySerializer.serialize(studentInformationForAccountRecovery);
  },
};
