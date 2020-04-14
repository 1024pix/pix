const usecases = require('../../domain/usecases');
const userSerializer = require('../../infrastructure/serializers/jsonapi/user-serializer');

module.exports = {

  async createAndAssociateUserToSchoolingRegistration(request, h) {
    const payload = request.payload.data.attributes;
    const userAttributes = {
      firstName: payload['first-name'],
      lastName: payload['last-name'],
      birthdate: payload['birthdate'],
      email: payload.email,
      username: payload.username,
      password: payload.password,
      withUsername: payload['with-username']
    };

    const createdUser = await usecases.createAndAssociateUserToSchoolingRegistration({ userAttributes, campaignCode: payload['campaign-code'] });

    return h.response(userSerializer.serialize(createdUser)).created();
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
          'generated-password': generatedPassword
        },
        type: 'schooling-registration-dependent-user'
      }
    };

    return h.response(schoolingRegistrationWithGeneratedPasswordResponse).code(200);
  },
};
