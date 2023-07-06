import { usecases } from '../../domain/usecases/index.js';
import * as csvCampaignsIdsParser from '../../infrastructure/serializers/csv/campaigns-administration/csv-campaigns-ids-parser.js';
import * as csvSerializer from '../../infrastructure/serializers/csv/csv-serializer.js';

const archiveCampaigns = async function (request, h, dependencies = { csvCampaignsIdsParser }) {
  const { userId } = request.auth.credentials;
  const campaignIds = await dependencies.csvCampaignsIdsParser.extractCampaignsIds(request.payload.path);

  await usecases.archiveCampaigns({
    userId,
    campaignIds,
  });

  return h.response(null).code(204);
};

const createCampaigns = async function (request, h, dependencies = { csvSerializer }) {
  const campaignsToCreate = await dependencies.csvSerializer.deserializeForCampaignsImport(request.payload.path);
  await usecases.createCampaigns({ campaignsToCreate });
  return h.response(null).code(204);
};

const campaignController = { archiveCampaigns, createCampaigns };

export { campaignController };
