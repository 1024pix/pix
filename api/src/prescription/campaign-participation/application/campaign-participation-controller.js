import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { extractLocaleFromRequest } from '../../../shared/infrastructure/utils/request-response-utils.js';
import { usecases } from '../domain/usecases/index.js';
import * as availableCampaignParticipationsSerializer from '../infrastructure/serializers/jsonapi/available-campaign-participation-serializer.js';
import * as campaignAnalysisSerializer from '../infrastructure/serializers/jsonapi/campaign-analysis-serializer.js';
import * as campaignAssessmentParticipationResultSerializer from '../infrastructure/serializers/jsonapi/campaign-assessment-participation-result-serializer.js';
import * as campaignAssessmentParticipationSerializer from '../infrastructure/serializers/jsonapi/campaign-assessment-participation-serializer.js';
import * as campaignParticipationOverviewSerializer from '../infrastructure/serializers/jsonapi/campaign-participation-overview-serializer.js';
import * as campaignParticipationSerializer from '../infrastructure/serializers/jsonapi/campaign-participation-serializer.js';
import * as campaignProfileSerializer from '../infrastructure/serializers/jsonapi/campaign-profile-serializer.js';
import * as participantResultSerializer from '../infrastructure/serializers/jsonapi/participant-result-serializer.js';
import * as participationForCampaignManagementSerializer from '../infrastructure/serializers/jsonapi/participation-for-campaign-management-serializer.js';

const getUserCampaignParticipationToCampaign = function (
  request,
  h,
  dependencies = { campaignParticipationSerializer },
) {
  const authenticatedUserId = request.auth.credentials.userId;
  const campaignId = request.params.campaignId;

  return usecases
    .getUserCampaignParticipationToCampaign({ userId: authenticatedUserId, campaignId })
    .then((campaignParticipation) => dependencies.campaignParticipationSerializer.serialize(campaignParticipation));
};

const findPaginatedParticipationsForCampaignManagement = async function (request) {
  const { campaignId } = request.params;
  const { page } = request.query;

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
  await DomainTransaction.execute(async () => {
    await usecases.deleteCampaignParticipation({
      userId,
      campaignId: id,
      campaignParticipationId,
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
  await usecases.deleteCampaignParticipationForAdmin({
    userId,
    campaignParticipationId,
  });
  return h.response({}).code(204);
};

const getCampaignParticipationsForOrganizationLearner = async function (
  request,
  h,
  dependencies = { availableCampaignParticipationsSerializer },
) {
  const { campaignId, organizationLearnerId } = request.params;
  const availableCampaignParticipations = await usecases.getCampaignParticipationsForOrganizationLearner({
    campaignId,
    organizationLearnerId,
  });
  return dependencies.availableCampaignParticipationsSerializer.serialize(availableCampaignParticipations);
};

const getCampaignParticipationOverviews = async function (
  request,
  h,
  dependencies = {
    campaignParticipationOverviewSerializer,
  },
) {
  const authenticatedUserId = request.auth.credentials.userId;
  const query = request.query;

  const userCampaignParticipationOverviews = await usecases.findUserCampaignParticipationOverviews({
    userId: authenticatedUserId,
    states: query.filter.states,
    page: query.page,
  });

  return dependencies.campaignParticipationOverviewSerializer.serializeForPaginatedList(
    userCampaignParticipationOverviews,
  );
};

const getUserCampaignAssessmentResult = async function (
  request,
  _,
  dependencies = {
    participantResultSerializer,
    extractLocaleFromRequest,
  },
) {
  const authenticatedUserId = request.auth.credentials.userId;
  const campaignId = request.params.campaignId;
  const locale = dependencies.extractLocaleFromRequest(request);

  const campaignAssessmentResult = await usecases.getUserCampaignAssessmentResult({
    userId: authenticatedUserId,
    campaignId,
    locale,
  });

  return dependencies.participantResultSerializer.serialize(campaignAssessmentResult);
};

const campaignParticipationController = {
  deleteCampaignParticipationForAdmin,
  deleteParticipation,
  findPaginatedParticipationsForCampaignManagement,
  getAnalysis,
  getCampaignAssessmentParticipation,
  getCampaignAssessmentParticipationResult,
  getCampaignParticipationOverviews,
  getCampaignParticipationsForOrganizationLearner,
  getCampaignProfile,
  getUserCampaignAssessmentResult,
  getUserCampaignParticipationToCampaign,
  updateParticipantExternalId,
};

export { campaignParticipationController };
