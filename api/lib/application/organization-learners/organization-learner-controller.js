const usecases = require('../../domain/usecases');
const organizationLearnerIdentitySerializer = require('../../infrastructure/serializers/jsonapi/organization-learner-identity-serializer');
const organizationLearnerUserAssociationSerializer = require('../../infrastructure/serializers/jsonapi/organization-learner-user-association-serializer');

module.exports = {
  async dissociate(request, h) {
    const organizationLearnerId = request.params.id;
    await usecases.dissociateUserFromOrganizationLearner({ organizationLearnerId });
    return h.response().code(204);
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

    if (h.request.path === `/api/schooling-registration-user-associations`) {
      return h
        .response(organizationLearnerUserAssociationSerializer.serialize(organizationLearner))
        .code(200)
        .header('Deprecation', 'true')
        .header('Link', `/api/organization-learners; rel="successor-version"`);
    }
    return h.response(organizationLearnerIdentitySerializer.serialize(organizationLearner)).code(200);
  },
};
