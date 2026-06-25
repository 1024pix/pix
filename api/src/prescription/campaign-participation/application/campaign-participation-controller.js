import { getChallengeLocale } from '../../../shared/infrastructure/utils/request-response-utils.js';
import { campaignResultLevelsPerTubesAndCompetencesSerializer } from '../../campaign/infrastructure/serializers/jsonapi/campaign-result-levels-per-tubes-and-competences-serializer.js';
import { usecases } from '../domain/usecases/index.js';
import { anonymisedCampaignAssessmentSerializer } from '../infrastructure/serializers/jsonapi/anonymised-campaign-assessment-serializer.js';
import { availableCampaignParticipationSerializer } from '../infrastructure/serializers/jsonapi/available-campaign-participation-serializer.js';
import { campaignAssessmentParticipationResultSerializer } from '../infrastructure/serializers/jsonapi/campaign-assessment-participation-result-serializer.js';
import { campaignAssessmentParticipationSerializer } from '../infrastructure/serializers/jsonapi/campaign-assessment-participation-serializer.js';
import { campaignParticipationOverviewSerializer } from '../infrastructure/serializers/jsonapi/campaign-participation-overview-serializer.js';
import { campaignParticipationSerializer } from '../infrastructure/serializers/jsonapi/campaign-participation-serializer.js';
import { campaignParticipationStatisticsSerializer } from '../infrastructure/serializers/jsonapi/campaign-participation-statistics-serializer.js';
import { campaignProfileSerializer } from '../infrastructure/serializers/jsonapi/campaign-profile-serializer.js';
import { participantResultSerializer } from '../infrastructure/serializers/jsonapi/participant-result-serializer.js';
import { participationForCampaignManagementSerializer } from '../infrastructure/serializers/jsonapi/participation-for-campaign-management-serializer.js';

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

const getLevelPerTubesAndCompetences = async function (
  request,
  _,
  dependencies = { campaignResultLevelsPerTubesAndCompetencesSerializer },
) {
  const { campaignParticipationId } = request.params;
  const locale = getChallengeLocale(request);

  const campaignParticipationAnalysis = await usecases.getResultLevelsPerTubesAndCompetences({
    campaignParticipationId,
    locale,
  });

  return dependencies.campaignResultLevelsPerTubesAndCompetencesSerializer.serialize(
    campaignParticipationAnalysis,
    true,
  );
};

const getCampaignProfile = async function (request, h, dependencies = { campaignProfileSerializer }) {
  const { userId } = request.auth.credentials;
  const { campaignId, campaignParticipationId } = request.params;
  const locale = getChallengeLocale(request);

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
  const { campaignId, campaignParticipationId } = request.params;
  await usecases.deleteCampaignParticipation({
    userId,
    campaignId,
    campaignParticipationId,
    userRole: 'ORGA_ADMIN',
    client: 'PIX_ORGA',
  });
  return h.response({}).code(204);
};

const deleteParticipationFromAdmin = async function (request, h) {
  const { userId } = request.auth.credentials;
  const { campaignId, campaignParticipationId } = request.params;
  await usecases.deleteCampaignParticipation({
    userId,
    campaignId,
    campaignParticipationId,
    userRole: 'SUPER_ADMIN',
    client: 'PIX_ADMIN',
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
  const locale = getChallengeLocale(request);

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

const getCampaignParticipationsForOrganizationLearner = async function (
  request,
  h,
  dependencies = { availableCampaignParticipationsSerializer: availableCampaignParticipationSerializer },
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
  });

  return dependencies.campaignParticipationOverviewSerializer.serialize(userCampaignParticipationOverviews);
};

const getAnonymisedCampaignAssessments = async function (
  request,
  h,
  dependencies = {
    anonymisedCampaignAssessmentSerializer,
  },
) {
  const authenticatedUserId = request.auth.credentials.userId;

  const assessments = await usecases.findUserAnonymisedCampaignAssessments({
    userId: authenticatedUserId,
  });

  return dependencies.anonymisedCampaignAssessmentSerializer.serialize(assessments);
};

const getUserCampaignAssessmentResult = async function (
  request,
  _,
  dependencies = {
    participantResultSerializer,
  },
) {
  const authenticatedUserId = request.auth.credentials.userId;
  const campaignId = request.params.campaignId;
  const locale = getChallengeLocale(request);

  const campaignAssessmentResult = await usecases.getUserCampaignAssessmentResult({
    userId: authenticatedUserId,
    campaignId,
    locale,
  });

  return dependencies.participantResultSerializer.serialize(campaignAssessmentResult);
};

const getParticipationStatistics = async function (
  request,
  h,
  dependencies = { campaignParticipationStatisticsSerializer },
) {
  const ownerId = request.auth.credentials.userId;
  const { organizationId } = request.params;
  const result = await usecases.getCampaignParticipationStatistics({ organizationId, ownerId });

  return h
    .response(dependencies.campaignParticipationStatisticsSerializer.serialize({ ...result, id: organizationId }))
    .code(200);
};

const campaignParticipationController = {
  deleteParticipation,
  deleteParticipationFromAdmin,
  findPaginatedParticipationsForCampaignManagement,
  getLevelPerTubesAndCompetences,
  getAnonymisedCampaignAssessments,
  getCampaignAssessmentParticipation,
  getCampaignAssessmentParticipationResult,
  getCampaignParticipationOverviews,
  getCampaignParticipationsForOrganizationLearner,
  getCampaignProfile,
  getParticipationStatistics,
  getUserCampaignAssessmentResult,
  getUserCampaignParticipationToCampaign,
  updateParticipantExternalId,
};

export { campaignParticipationController };
