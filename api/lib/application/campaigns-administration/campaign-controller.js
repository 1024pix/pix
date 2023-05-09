import { usecases } from '../../domain/usecases/index.js';
import { csvCampaignsIdsParser } from '../../infrastructure/serializers/csv/campaigns-administration/csv-campaigns-ids-parser.js';

const archiveCampaigns = async function (request, h, dependencies = { csvCampaignsIdsParser }) {
  const { userId } = request.auth.credentials;
  const campaignIds = await dependencies.csvCampaignsIdsParser.extractCampaignsIds(request.payload.path);

  await usecases.campaignAdministrationArchiveCampaign({
    userId,
    campaignIds,
  });

  return h.response(null).code(204);
};

export { archiveCampaigns };
