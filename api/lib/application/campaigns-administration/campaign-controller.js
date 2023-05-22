import { usecases } from '../../domain/usecases/index.js';
import * as csvCampaignsIdsParser from '../../infrastructure/serializers/csv/campaigns-administration/csv-campaigns-ids-parser.js';

const archiveCampaigns = async function (request, h, dependencies = { csvCampaignsIdsParser }) {
  const { userId } = request.auth.credentials;
  const campaignIds = await dependencies.csvCampaignsIdsParser.extractCampaignsIds(request.payload.path);

  await usecases.archiveCampaigns({
    userId,
    campaignIds,
  });

  return h.response(null).code(204);
};

const campaignController = { archiveCampaigns };

export { campaignController };
