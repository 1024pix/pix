const usecases = require('../../domain/usecases');
const organizationLearnerIdentitySerializer = require('../../infrastructure/serializers/jsonapi/organization-learner-identity-serializer');
const organizationLearnerActivitySerializer = require('../../infrastructure/serializers/jsonapi/organization-learner-activity-serializer');

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

    return h.response(organizationLearnerIdentitySerializer.serialize(organizationLearner)).code(200);
  },

  async getActivity(request, h) {
    const organizationLearnerId = request.params.id;
    const activity = await usecases.getOrganizationLearnerActivity({ organizationLearnerId });
    return h.response(organizationLearnerActivitySerializer.serialize(activity)).code(200);
  },
};
