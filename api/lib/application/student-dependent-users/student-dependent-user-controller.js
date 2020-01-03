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
      password: payload.password,
    };

    const createdUser = await usecases.createAndAssociateUserToStudent({ userAttributes, campaignCode: payload['campaign-code'] });

    return h.response(userSerializer.serialize(createdUser)).created();
  }
};
