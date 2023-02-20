import usecases from '../../domain/usecases';
import csvCampaingsIdsParser from '../../infrastructure/serializers/csv/campaigns-administration/csv-campaigns-ids-parser';

export default {
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
