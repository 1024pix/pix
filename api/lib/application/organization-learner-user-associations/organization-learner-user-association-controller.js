const usecases = require('../../domain/usecases');
const organizationLearnerSerializer = require('../../infrastructure/serializers/jsonapi/organization-learner-user-association-serializer');

module.exports = {
  async reconcileOrganizationLearnerAutomatically(request) {
    const authenticatedUserId = request.auth.credentials.userId;
    const payload = request.payload.data.attributes;
    const campaignCode = payload['campaign-code'];
    const organizationLearner = await usecases.reconcileUserToOrganization({
      userId: authenticatedUserId,
      campaignCode,
    });
    return organizationLearnerSerializer.serialize(organizationLearner);
  },

  async reconcileOrganizationLearnerManually(request, h) {
    const authenticatedUserId = request.auth.credentials.userId;
    const payload = request.payload.data.attributes;
    const campaignCode = payload['campaign-code'];
    const withReconciliation = request.query.withReconciliation === 'true';

    const reconciliationInfo = {
      id: authenticatedUserId,
      firstName: payload['first-name'],
      lastName: payload['last-name'],
      birthdate: payload['birthdate'],
    };

    const organizationLearner = await usecases.reconcileOrganizationLearner({
      campaignCode,
      reconciliationInfo,
      withReconciliation,
    });

    if (withReconciliation) {
      return organizationLearnerSerializer.serialize(organizationLearner);
    }

    return h.response().code(204);
  },

  async reconcileSupOrganizationLearner(request, h) {
    const userId = request.auth.credentials.userId;
    const payload = request.payload.data.attributes;

    const campaignCode = payload['campaign-code'];

    const reconciliationInfo = {
      userId,
      studentNumber: payload['student-number'],
      firstName: payload['first-name'],
      lastName: payload['last-name'],
      birthdate: payload['birthdate'],
    };

    await usecases.reconcileSupOrganizationLearner({ campaignCode, reconciliationInfo });

    return h.response(null).code(204);
  },

  async generateUsername(request, h) {
    const payload = request.payload.data.attributes;
    const { 'campaign-code': campaignCode } = payload;

    const studentInformation = {
      firstName: payload['first-name'],
      lastName: payload['last-name'],
      birthdate: payload['birthdate'],
    };

    const username = await usecases.generateUsername({ campaignCode, studentInformation });

    // we don't persist this ressource, we simulate response by adding the generated username
    const organizationLearnerWithUsernameResponse = {
      data: {
        attributes: {
          'last-name': payload['last-name'],
          'first-name': payload['first-name'],
          birthdate: payload['birthdate'],
          'campaign-code': campaignCode,
          username,
        },
        type: 'schooling-registration-user-associations',
      },
    };
    return h.response(organizationLearnerWithUsernameResponse).code(200);
  },

  async updateStudentNumber(request, h) {
    const payload = request.payload.data.attributes;
    const organizationId = request.params.id;
    const studentNumber = payload['student-number'];
    const organizationLearnerId = request.params.schoolingRegistrationId;

    await usecases.updateStudentNumber({ organizationLearnerId, studentNumber, organizationId });
    return h.response().code(204);
  },
};
