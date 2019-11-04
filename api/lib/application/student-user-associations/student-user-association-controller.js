const usecases = require('../../domain/usecases');
const requestResponseUtils = require('../../infrastructure/utils/request-response-utils');

module.exports = {

  async associate(request, h) {
    const payload = request.payload.data.attributes;
    const userId = requestResponseUtils.extractUserIdFromRequest(request);
    const user = {
      id: userId,
      firstName: payload['first-name'],
      lastName: payload['last-name'],
      birthdate: payload['birthdate'],
    };

    await usecases.linkUserToOrganizationStudentData({ campaignCode: payload['campaign-code'], user });
    return h.response().code(204);
  }
};
