const usecases = require('../../domain/usecases/index.js');
const csvCampaingsIdsParser = require('../../infrastructure/serializers/csv/campaigns-administration/csv-campaigns-ids-parser');

module.exports = {
  async archiveCampaigns(request, h) {
    const { userId } = request.auth.credentials;
    const campaignIds = await csvCampaingsIdsParser.extractCampaignsIds(request.payload.path);

    await usecases.campaignAdministrationArchiveCampaign({
      userId,
      campaignIds,
    });

    return h.response(null).code(204);
  },
};
