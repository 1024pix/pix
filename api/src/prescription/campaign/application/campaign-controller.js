import { extractLocaleFromRequest } from '../../../shared/infrastructure/utils/request-response-utils.js';
import * as campaignAnalysisSerializer from '../../campaign-participation/infrastructure/serializers/jsonapi/campaign-analysis-serializer.js';
import { usecases } from '../domain/usecases/index.js';
import * as campaignResultLevelsPerTubesAndCompetencesSerializer from '../infrastructure/serializers/jsonapi/campaign-result-levels-per-tubes-and-competences-serializer.js';
import * as divisionSerializer from '../infrastructure/serializers/jsonapi/division-serializer.js';
import * as groupSerializer from '../infrastructure/serializers/jsonapi/group-serializer.js';
import * as presentationStepsSerializer from '../infrastructure/serializers/jsonapi/presentation-steps-serializer.js';

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
  const { campaignId } = request.params;
  const locale = extractLocaleFromRequest(request);
  const campaignAnalysis = await usecases.computeCampaignAnalysis({ userId, campaignId, locale });
  return dependencies.campaignAnalysisSerializer.serialize(campaignAnalysis);
};

const getPresentationSteps = async function (
  request,
  _,
  dependencies = { presentationStepsSerializer, extractLocaleFromRequest },
) {
  const { userId } = request.auth.credentials;
  const campaignCode = request.params.campaignCode;
  const locale = dependencies.extractLocaleFromRequest(request);

  const presentationSteps = await usecases.getPresentationSteps({ userId, campaignCode, locale });
  return dependencies.presentationStepsSerializer.serialize(presentationSteps);
};

const getLevelPerTubesAndCompetences = async function (
  request,
  h,
  dependencies = { campaignResultLevelsPerTubesAndCompetencesSerializer },
) {
  const { campaignId } = request.params;
  const locale = extractLocaleFromRequest(request);
  const campaignAnalysis = await usecases.getResultLevelsPerTubesAndCompetences({
    campaignId,
    locale,
  });
  return dependencies.campaignResultLevelsPerTubesAndCompetencesSerializer.serialize(campaignAnalysis);
};
const campaignController = {
  division,
  getAnalysis,
  getGroups,
  getPresentationSteps,
  getLevelPerTubesAndCompetences,
};

export { campaignController };
