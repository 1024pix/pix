const usecases = require('../../domain/usecases/index.js');
const organizationLearnerIdentitySerializer = require('../../infrastructure/serializers/jsonapi/organization-learner-identity-serializer.js');
const organizationLearnerActivitySerializer = require('../../infrastructure/serializers/jsonapi/organization-learner-activity-serializer.js');
const organizationLearnerSerializer = require('../../infrastructure/serializers/jsonapi/organization-learner-follow-up/organization-learner-serializer.js');

module.exports = {
  async dissociate(request, h) {
    const organizationLearnerId = request.params.id;
    await usecases.dissociateUserFromOrganizationLearner({ organizationLearnerId });
    return h.response().code(204);
  },

  async findAssociation(request, h, dependencies = { organizationLearnerIdentitySerializer }) {
    const authenticatedUserId = request.auth.credentials.userId;
    // eslint-disable-next-line no-restricted-syntax
    const requestedUserId = parseInt(request.query.userId);
    const campaignCode = request.query.campaignCode;

    const organizationLearner = await usecases.findAssociationBetweenUserAndOrganizationLearner({
      authenticatedUserId,
      requestedUserId,
      campaignCode,
    });

    return h.response(dependencies.organizationLearnerIdentitySerializer.serialize(organizationLearner)).code(200);
  },

  async getActivity(request, h, dependencies = { organizationLearnerActivitySerializer }) {
    const organizationLearnerId = request.params.id;
    const activity = await usecases.getOrganizationLearnerActivity({ organizationLearnerId });
    return h.response(dependencies.organizationLearnerActivitySerializer.serialize(activity)).code(200);
  },

  async getLearner(request, h, dependencies = { organizationLearnerSerializer }) {
    const organizationLearnerId = request.params.id;
    const learner = await usecases.getOrganizationLearner({ organizationLearnerId });
    return h.response(dependencies.organizationLearnerSerializer.serialize(learner)).code(200);
  },
};
