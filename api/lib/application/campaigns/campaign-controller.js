import * as campaignAnalysisSerializer from '../../../src/prescription/campaign-participation/infrastructure/serializers/jsonapi/campaign-analysis-serializer.js';
import { extractLocaleFromRequest } from '../../../src/shared/infrastructure/utils/request-response-utils.js';
import { usecases } from '../../domain/usecases/index.js';

const getAnalysis = async function (request, h, dependencies = { campaignAnalysisSerializer }) {
  const { userId } = request.auth.credentials;
  const campaignId = request.params.id;
  const locale = extractLocaleFromRequest(request);

  const campaignAnalysis = await usecases.computeCampaignAnalysis({ userId, campaignId, locale });
  return dependencies.campaignAnalysisSerializer.serialize(campaignAnalysis);
};

const campaignController = {
  getAnalysis,
};

export { campaignController };
