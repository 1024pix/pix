const usecases = require('../../domain/usecases');
const studentSerializer = require('../../infrastructure/serializers/jsonapi/student-serializer');
const schoolingRegistrationSerializer = require('../../infrastructure/serializers/jsonapi/schooling-registration-user-association-serializer');
const _ = require('lodash');

function _isReconciliationWithUserDetails(payload) {
  return _.every(['first-name', 'last-name', 'birthdate'], _.partial(_.has, payload));
}

module.exports = {

  async associate(request) {
    const authenticatedUserId = request.auth.credentials.userId;
    const payload = request.payload.data.attributes;
    const campaignCode = payload['campaign-code'];
    let schoolingRegistration;

    if (_isReconciliationWithUserDetails(payload)) {
      const user = {
        id: authenticatedUserId,
        firstName: payload['first-name'],
        lastName: payload['last-name'],
        birthdate: payload['birthdate'],
      };

      schoolingRegistration =  await usecases.linkUserToSchoolingRegistrationData({ campaignCode, user });
    } else {
      schoolingRegistration  = await usecases.reconcileUserToOrganization({ userId: authenticatedUserId, campaignCode });
    }

    return schoolingRegistrationSerializer.serialize(schoolingRegistration);
  },

  findAssociation(request) {
    const authenticatedUserId = request.auth.credentials.userId;
    const requestedUserId = parseInt(request.query.userId);
    const campaignCode = request.query.campaignCode;

    return usecases.findAssociationBetweenUserAndSchoolingRegistration({ authenticatedUserId, requestedUserId, campaignCode })
      .then(studentSerializer.serialize);
  },

  async generateUsername(request, h) {
    const payload = request.payload.data.attributes;
    const { 'campaign-code': campaignCode } = payload;

    const user = {
      firstName: payload['first-name'],
      lastName: payload['last-name'],
      birthdate: payload['birthdate'],
    };

    const username = await usecases.generateUsername({ campaignCode, user });

    // we don't persist this ressource, we simulate response by adding the generated username
    const schoolingRegistrationWithUsernameResponse = {
      data: {
        attributes: {
          'last-name': payload['last-name'],
          'first-name': payload['first-name'],
          birthdate: payload['birthdate'],
          'campaign-code': campaignCode,
          username
        },
        type: 'student-user-associations'
      }
    };
    return h.response(schoolingRegistrationWithUsernameResponse).code(200);
  },

  async dissociate(request, h) {
    const payload = request.payload.data.attributes;
    const { userId } = request.auth.credentials;
    await usecases.dissociateUserFromSchoolingRegistration({ userId, schoolingRegistrationId: payload['schooling-registration-id'] });
    return h.response().code(204);
  }
};
