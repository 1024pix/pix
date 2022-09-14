const usecases = require('../../domain/usecases');

module.exports = {
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

  async updateStudentNumber(request, h) {
    const payload = request.payload.data.attributes;
    const organizationId = request.params.id;
    const studentNumber = payload['student-number'];
    const organizationLearnerId = request.params.schoolingRegistrationId || request.params.organizationLearnerId;

    await usecases.updateStudentNumber({ organizationLearnerId, studentNumber, organizationId });

    const response = h.response().code(204);
    if (
      h.request.path ===
      `/api/organizations/${organizationId}/schooling-registration-user-associations/${organizationLearnerId}`
    ) {
      response
        .header('Deprecation', 'true')
        .header(
          'Link',
          `/api/organizations/${organizationId}/sup-organization-learners/${organizationLearnerId}; rel="successor-version"`
        );
    }
    return response;
  },
};
