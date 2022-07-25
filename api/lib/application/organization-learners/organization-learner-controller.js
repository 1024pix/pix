const usecases = require('../../domain/usecases');
const organizationLearnerIdentitySerializer = require('../../infrastructure/serializers/jsonapi/organization-learner-identity-serializer');

module.exports = {
  async dissociate(request, h) {
    const organizationLearnerId = request.params.id;
    await usecases.dissociateUserFromOrganizationLearner({ organizationLearnerId });
    const response = h.response().code(204);
    if (h.request.path === `/api/schooling-registration-user-associations/${request.params.id}`) {
      response
        .header('Deprecation', 'true')
        .header('Link', `/api/organization-learners/${request.params.id}/association; rel="successor-version"`);
    }
    return response;
  },

  async findAssociation(request, h) {
    const authenticatedUserId = request.auth.credentials.userId;
    // eslint-disable-next-line no-restricted-syntax
    const requestedUserId = parseInt(request.query.userId);
    const campaignCode = request.query.campaignCode;

    const organizationLearner = await usecases.findAssociationBetweenUserAndOrganizationLearner({
      authenticatedUserId,
      requestedUserId,
      campaignCode,
    });

    const response = h.response(organizationLearnerIdentitySerializer.serialize(organizationLearner)).code(200);
    if (h.request.path === `/api/schooling-registration-user-associations`) {
      response.header('Deprecation', 'true').header('Link', `/api/organization-learners; rel="successor-version"`);
    }
    return response;
  },
};
