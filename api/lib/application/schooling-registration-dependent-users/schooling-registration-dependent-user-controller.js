const usecases = require('../../domain/usecases');
const schoolingRegistrationDependentUser = require('../../infrastructure/serializers/jsonapi/schooling-registration-dependent-user-serializer');
const { extractLocaleFromRequest } = require('../../infrastructure/utils/request-response-utils');
const tokenService = require('../../domain/services/token-service');

module.exports = {

  async createAndReconcileUserToSchoolingRegistration(request, h) {
    const payload = request.payload.data.attributes;
    const userAttributes = {
      firstName: payload['first-name'],
      lastName: payload['last-name'],
      birthdate: payload['birthdate'],
      email: payload.email,
      username: payload.username,
      password: payload.password,
      withUsername: payload['with-username'],
    };
    const locale = extractLocaleFromRequest(request);

    await usecases.createAndReconcileUserToSchoolingRegistration({ userAttributes, campaignCode: payload['campaign-code'], locale });

    return h.response().code(204);
  },

  async createUserAndReconcileToSchoolingRegistrationFromExternalUser(request, h) {
    const {
      'campaign-code': campaignCode,
      'external-user-token': token,
      birthdate } = request.payload.data.attributes;

    const createdUser = await usecases.createUserAndReconcileToSchoolingRegistrationFromExternalUser({ campaignCode, token, birthdate });

    const accessToken = tokenService.createAccessTokenFromUser(createdUser.id, 'external');

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
    const userId = parseInt(request.auth.credentials.userId);
    const organizationId = parseInt(payload['organization-id']);
    const schoolingRegistrationId = parseInt(payload['schooling-registration-id']);

    const generatedPassword = await usecases.updateSchoolingRegistrationDependentUserPassword({
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
    const organizationId = parseInt(payload['organization-id']);
    const schoolingRegistrationId = parseInt(payload['schooling-registration-id']);

    const result = await usecases.generateUsernameWithTemporaryPassword({
      schoolingRegistrationId,
      organizationId,
    });

    const schoolingRegistrationWithGeneratedUsernamePasswordResponse = schoolingRegistrationDependentUser.serialize(result);

    return h.response(schoolingRegistrationWithGeneratedUsernamePasswordResponse).code(200);
  },
};
