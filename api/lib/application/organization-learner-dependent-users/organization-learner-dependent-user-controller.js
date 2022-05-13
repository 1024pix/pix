const usecases = require('../../domain/usecases');
const schoolingRegistrationDependentUser = require('../../infrastructure/serializers/jsonapi/organization-learner-dependent-user-serializer');
const { extractLocaleFromRequest } = require('../../infrastructure/utils/request-response-utils');
const studentInformationForAccountRecoverySerializer = require('../../infrastructure/serializers/jsonapi/student-information-for-account-recovery-serializer');

module.exports = {
  async createAndReconcileUserToOrganizationLearner(request, h) {
    const payload = request.payload.data.attributes;
    const userAttributes = {
      firstName: payload['first-name'],
      lastName: payload['last-name'],
      birthdate: payload['birthdate'],
      email: payload.email,
      username: payload.username,
      withUsername: payload['with-username'],
    };
    const locale = extractLocaleFromRequest(request);

    await usecases.createAndReconcileUserToOrganizationLearner({
      userAttributes,
      password: payload.password,
      campaignCode: payload['campaign-code'],
      locale,
    });

    return h.response().code(204);
  },

  async createUserAndReconcileToOrganizationLearnerFromExternalUser(request, h) {
    const { birthdate, 'campaign-code': campaignCode, 'external-user-token': token } = request.payload.data.attributes;

    const accessToken = await usecases.createUserAndReconcileToOrganizationLearnerFromExternalUser({
      birthdate,
      campaignCode,
      token,
    });

    const response = {
      data: {
        attributes: {
          'access-token': accessToken,
        },
        type: 'external-users',
      },
    };

    return h.response(response).code(200);
  },

  async updatePassword(request, h) {
    const payload = request.payload.data.attributes;
    const userId = request.auth.credentials.userId;
    const organizationId = payload['organization-id'];
    const schoolingRegistrationId = payload['schooling-registration-id'];

    const generatedPassword = await usecases.updateOrganizationLearnerDependentUserPassword({
      userId,
      organizationId,
      schoolingRegistrationId,
    });

    const schoolingRegistrationWithGeneratedPasswordResponse = {
      data: {
        attributes: {
          'generated-password': generatedPassword,
        },
        type: 'schooling-registration-dependent-user',
      },
    };

    return h.response(schoolingRegistrationWithGeneratedPasswordResponse).code(200);
  },

  async generateUsernameWithTemporaryPassword(request, h) {
    const payload = request.payload.data.attributes;
    const organizationId = payload['organization-id'];
    const organizationLearnerId = payload['schooling-registration-id'];

    const result = await usecases.generateUsernameWithTemporaryPassword({
      organizationLearnerId,
      organizationId,
    });

    const schoolingRegistrationWithGeneratedUsernamePasswordResponse =
      schoolingRegistrationDependentUser.serialize(result);

    return h.response(schoolingRegistrationWithGeneratedUsernamePasswordResponse).code(200);
  },

  async checkScoAccountRecovery(request) {
    const studentInformation = await studentInformationForAccountRecoverySerializer.deserialize(request.payload);

    const studentInformationForAccountRecovery = await usecases.checkScoAccountRecovery({
      studentInformation,
    });

    return studentInformationForAccountRecoverySerializer.serialize(studentInformationForAccountRecovery);
  },
};
