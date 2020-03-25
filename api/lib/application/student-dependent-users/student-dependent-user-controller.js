const usecases = require('../../domain/usecases');
const userSerializer = require('../../infrastructure/serializers/jsonapi/user-serializer');

module.exports = {

  async createAndAssociateUserToStudent(request, h) {
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

  async updatePassword(request) {
    const payload = request.payload.data.attributes;
    const userId = parseInt(request.auth.credentials.userId);
    const organizationId = parseInt(payload['organization-id']);
    const schoolingRegistrationId = parseInt(payload['student-id']);
    const password = payload.password;

    const updatedUser = await usecases.updateStudentDependentUserPassword({
      userId,
      organizationId,
      schoolingRegistrationId,
      password,
    });

    return userSerializer.serialize(updatedUser);
  },
};
