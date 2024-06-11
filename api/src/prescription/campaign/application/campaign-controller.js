import { extractLocaleFromRequest } from '../../../shared/infrastructure/utils/request-response-utils.js';
import * as campaignAnalysisSerializer from '../../campaign-participation/infrastructure/serializers/jsonapi/campaign-analysis-serializer.js';
import { usecases } from '../domain/usecases/index.js';
import * as divisionSerializer from '../infrastructure/serializers/jsonapi/division-serializer.js';
import * as groupSerializer from '../infrastructure/serializers/jsonapi/group-serializer.js';

const division = async function (request) {
  const { userId } = request.auth.credentials;
  const campaignId = request.params.campaignId;

  const divisions = await usecases.getParticipantsDivision({ userId, campaignId });
  return divisionSerializer.serialize(divisions);
};

const getGroups = async function (request) {
  const { userId } = request.auth.credentials;
  const campaignId = request.params.campaignId;

  const groups = await usecases.getParticipantsGroup({ userId, campaignId });
  return groupSerializer.serialize(groups);
};

const getAnalysis = async function (request, h, dependencies = { campaignAnalysisSerializer }) {
  const { userId } = request.auth.credentials;
  const campaignId = request.params.id;
  const locale = extractLocaleFromRequest(request);
  const campaignAnalysis = await usecases.computeCampaignAnalysis({ userId, campaignId, locale });
  return dependencies.campaignAnalysisSerializer.serialize(campaignAnalysis);
};

const campaignController = {
  division,
  getAnalysis,
  getGroups,
};

export { campaignController };
