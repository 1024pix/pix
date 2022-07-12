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

    const response = h.response(null).code(204);
    if (h.request.path === '/api/schooling-registration-user-associations/student') {
      response
        .header('Deprecation', 'true')
        .header('Link', '/api/sup-organization-learners/association; rel="successor-version"');
    }
    return response;
  },
};
