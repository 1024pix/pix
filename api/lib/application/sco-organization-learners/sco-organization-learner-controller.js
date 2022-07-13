const usecases = require('../../domain/usecases');
const scoOrganizationLearnerSerializer = require('../../infrastructure/serializers/jsonapi/sco-organization-learner-serializer');
const organizationLearnerUserAssociationSerializer = require('../../infrastructure/serializers/jsonapi/organization-learner-user-association-serializer');

module.exports = {
  async reconcileScoOrganizationLearnerManually(request, h) {
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

    const organizationLearner = await usecases.reconcileScoOrganizationLearnerManually({
      campaignCode,
      reconciliationInfo,
      withReconciliation,
    });

    let response;
    if (withReconciliation) {
      let serializedData;
      if (h.request.path === '/api/schooling-registration-user-associations') {
        serializedData = organizationLearnerUserAssociationSerializer.serialize(organizationLearner);
      } else {
        serializedData = scoOrganizationLearnerSerializer.serializeIdentity(organizationLearner);
      }
      response = h.response(serializedData).code(200);
    } else {
      response = h.response().code(204);
    }

    if (h.request.path === '/api/schooling-registration-user-associations') {
      response = response
        .header('Deprecation', 'true')
        .header('Link', '/api/sco-organization-learners/association; rel="successor-version"');
    }
    return response;
  },

  async reconcileScoOrganizationLearnerAutomatically(request, h) {
    const authenticatedUserId = request.auth.credentials.userId;
    const payload = request.payload.data.attributes;
    const campaignCode = payload['campaign-code'];
    const organizationLearner = await usecases.reconcileScoOrganizationLearnerAutomatically({
      userId: authenticatedUserId,
      campaignCode,
    });

    if (h.request.path === '/api/schooling-registration-user-associations/auto') {
      return h
        .response(organizationLearnerUserAssociationSerializer.serialize(organizationLearner))
        .header('Deprecation', 'true')
        .header('Link', '/api/sco-organization-learners/association/auto; rel="successor-version"');
    }
    return h.response(scoOrganizationLearnerSerializer.serializeIdentity(organizationLearner));
  },
};
