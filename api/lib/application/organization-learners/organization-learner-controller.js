const usecases = require('../../domain/usecases');

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
};
