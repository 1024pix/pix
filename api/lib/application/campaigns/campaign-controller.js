import * as campaignAnalysisSerializer from '../../../src/prescription/campaign-participation/infrastructure/serializers/jsonapi/campaign-analysis-serializer.js';
import { extractLocaleFromRequest } from '../../../src/shared/infrastructure/utils/request-response-utils.js';
import { usecases } from '../../../src/prescription/campaign/domain/usecases/index.js';

const getAnalysis = async function (request, h, dependencies = { campaignAnalysisSerializer }) {
  const { userId } = request.auth.credentials;
  const campaignId = request.params.id;
  const locale = extractLocaleFromRequest(request);
  try {
    const campaignAnalysis = await usecases.computeCampaignAnalysis({ userId, campaignId, locale });
    return dependencies.campaignAnalysisSerializer.serialize(campaignAnalysis);
  } catch (err) {
    console.log({ err });
    return err;
  }
};

const campaignController = {
  getAnalysis,
};

export { campaignController };
