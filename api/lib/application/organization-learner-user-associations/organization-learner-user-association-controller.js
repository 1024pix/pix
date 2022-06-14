const usecases = require('../../domain/usecases');
const organizationLearnerSerializer = require('../../infrastructure/serializers/jsonapi/organization-learner-user-association-serializer');

module.exports = {
  async reconcileOrganizationLearnerAutomatically(request) {
    const authenticatedUserId = request.auth.credentials.userId;
    const payload = request.payload.data.attributes;
    const campaignCode = payload['campaign-code'];
    const schoolingRegistration = await usecases.reconcileUserToOrganization({
      userId: authenticatedUserId,
      campaignCode,
    });
    return organizationLearnerSerializer.serialize(schoolingRegistration);
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

    const schoolingRegistration = await usecases.reconcileOrganizationLearner({
      campaignCode,
      reconciliationInfo,
      withReconciliation,
    });

    if (withReconciliation) {
      return organizationLearnerSerializer.serialize(schoolingRegistration);
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

  async findAssociation(request) {
    const authenticatedUserId = request.auth.credentials.userId;
    // eslint-disable-next-line no-restricted-syntax
    const requestedUserId = parseInt(request.query.userId);
    const campaignCode = request.query.campaignCode;

    const schoolingRegistration = await usecases.findAssociationBetweenUserAndOrganizationLearner({
      authenticatedUserId,
      requestedUserId,
      campaignCode,
    });

    return organizationLearnerSerializer.serialize(schoolingRegistration);
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
    const schoolingRegistrationWithUsernameResponse = {
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
    return h.response(schoolingRegistrationWithUsernameResponse).code(200);
  },

  async dissociate(request, h) {
    const organizationLearnerId = request.params.id;
    await usecases.dissociateUserFromOrganizationLearner({ organizationLearnerId });
    return h.response().code(204);
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
