const usecases = require('../../domain/usecases');
const serializer = require('../../infrastructure/serializers/jsonapi/participant-result-serializer');
const { extractLocaleFromRequest } = require('../../infrastructure/utils/request-response-utils');

module.exports = {
  async get(request) {
    const locale = extractLocaleFromRequest(request);
    const campaignParticipationId = parseInt(request.params.id);
    const userId = request.auth.credentials.userId;

    const participationResult = await usecases.getParticipantResult({ campaignParticipationId, userId, locale });

    return serializer.serialize(participationResult);
  },
};
