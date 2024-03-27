import { extractLocaleFromRequest } from '../../../../lib/infrastructure/utils/request-response-utils.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { extractParameters } from '../../../shared/infrastructure/utils/query-params-utils.js';
import { usecases } from '../domain/usecases/index.js';
import * as campaignAnalysisSerializer from '../infrastructure/serializers/jsonapi/campaign-analysis-serializer.js';
import * as campaignAssessmentParticipationResultSerializer from '../infrastructure/serializers/jsonapi/campaign-assessment-participation-result-serializer.js';
import * as campaignAssessmentParticipationSerializer from '../infrastructure/serializers/jsonapi/campaign-assessment-participation-serializer.js';
import * as campaignProfileSerializer from '../infrastructure/serializers/jsonapi/campaign-profile-serializer.js';
import * as participationForCampaignManagementSerializer from '../infrastructure/serializers/jsonapi/participation-for-campaign-management-serializer.js';

const findPaginatedParticipationsForCampaignManagement = async function (request) {
  const { campaignId } = request.params;
  const { page } = extractParameters(request.query);

  const { models: participationsForCampaignManagement, meta } =
    await usecases.findPaginatedParticipationsForCampaignManagement({
      campaignId,
      page,
    });
  return participationForCampaignManagementSerializer.serialize(participationsForCampaignManagement, meta);
};

const getAnalysis = async function (request, h, dependencies = { campaignAnalysisSerializer }) {
  const { userId } = request.auth.credentials;
  const campaignParticipationId = request.params.id;
  const locale = extractLocaleFromRequest(request);

  const campaignAnalysis = await usecases.computeCampaignParticipationAnalysis({
    userId,
    campaignParticipationId,
    locale,
  });
  return dependencies.campaignAnalysisSerializer.serialize(campaignAnalysis);
};

const getCampaignProfile = async function (request, h, dependencies = { campaignProfileSerializer }) {
  const { userId } = request.auth.credentials;
  const { campaignId, campaignParticipationId } = request.params;
  const locale = extractLocaleFromRequest(request);

  const campaignProfile = await usecases.getCampaignProfile({ userId, campaignId, campaignParticipationId, locale });
  return dependencies.campaignProfileSerializer.serialize(campaignProfile);
};

const getCampaignAssessmentParticipation = async function (request) {
  const { userId } = request.auth.credentials;
  const { campaignId, campaignParticipationId } = request.params;

  const campaignAssessmentParticipation = await usecases.getCampaignAssessmentParticipation({
    userId,
    campaignId,
    campaignParticipationId,
  });
  return campaignAssessmentParticipationSerializer.serialize(campaignAssessmentParticipation);
};

const deleteParticipation = async function (request, h) {
  const { userId } = request.auth.credentials;
  const { id, campaignParticipationId } = request.params;
  await DomainTransaction.execute(async (domainTransaction) => {
    await usecases.deleteCampaignParticipation({
      userId,
      campaignId: id,
      campaignParticipationId,
      domainTransaction,
    });
  });
  return h.response({}).code(204);
};

const getCampaignAssessmentParticipationResult = async function (
  request,
  h,
  dependencies = { campaignAssessmentParticipationResultSerializer },
) {
  const { userId } = request.auth.credentials;
  const { campaignId, campaignParticipationId } = request.params;
  const locale = extractLocaleFromRequest(request);

  const campaignAssessmentParticipationResult = await usecases.getCampaignAssessmentParticipationResult({
    userId,
    campaignId,
    campaignParticipationId,
    locale,
  });
  return dependencies.campaignAssessmentParticipationResultSerializer.serialize(campaignAssessmentParticipationResult);
};

const updateParticipantExternalId = async function (request, h) {
  const campaignParticipationId = request.params.id;
  const participantExternalId = request.payload.data.attributes['participant-external-id'];

  await usecases.updateParticipantExternalId({ campaignParticipationId, participantExternalId });
  return h.response({}).code(204);
};

const deleteCampaignParticipationForAdmin = async function (request, h) {
  const { userId } = request.auth.credentials;
  const { id: campaignParticipationId } = request.params;
  await DomainTransaction.execute(async (domainTransaction) => {
    await usecases.deleteCampaignParticipationForAdmin({
      userId,
      campaignParticipationId,
      domainTransaction,
    });
  });
  return h.response({}).code(204);
};

const campaignParticipationController = {
  findPaginatedParticipationsForCampaignManagement,
  getAnalysis,
  getCampaignProfile,
  getCampaignAssessmentParticipation,
  deleteParticipation,
  getCampaignAssessmentParticipationResult,
  updateParticipantExternalId,
  deleteCampaignParticipationForAdmin,
};

export { campaignParticipationController };
