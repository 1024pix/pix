const usecases = require('../../domain/usecases/index.js');
const csvCampaignsIdsParser = require('../../infrastructure/serializers/csv/campaigns-administration/csv-campaigns-ids-parser.js');

module.exports = {
  async archiveCampaigns(request, h, dependencies = { csvCampaignsIdsParser }) {
    const { userId } = request.auth.credentials;
    const campaignIds = await dependencies.csvCampaignsIdsParser.extractCampaignsIds(request.payload.path);

    await usecases.campaignAdministrationArchiveCampaign({
      userId,
      campaignIds,
    });

    return h.response(null).code(204);
  },
};
