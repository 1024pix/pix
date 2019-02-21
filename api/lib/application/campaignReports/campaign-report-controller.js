const usecases = require('../../domain/usecases');
const serializer = require('../../infrastructure/serializers/jsonapi/campaign-report-serializer');

module.exports = {
  async get(request) {
    const campaignId = parseInt(request.params.id);

    const report = await usecases.getCampaignReport({ campaignId });

    return serializer.serialize(report);
  },
};
