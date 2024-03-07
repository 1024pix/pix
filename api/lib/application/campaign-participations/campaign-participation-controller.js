import { usecases as devcompUsecases } from '../../../src/devcomp/domain/usecases/index.js';
import * as trainingSerializer from '../../../src/devcomp/infrastructure/serializers/jsonapi/training-serializer.js';
import { usecases } from '../../domain/usecases/index.js';
import { DomainTransaction } from '../../infrastructure/DomainTransaction.js';
import * as campaignAnalysisSerializer from '../../infrastructure/serializers/jsonapi/campaign-analysis-serializer.js';
import * as campaignAssessmentParticipationResultSerializer from '../../infrastructure/serializers/jsonapi/campaign-assessment-participation-result-serializer.js';
import * as campaignAssessmentParticipationSerializer from '../../infrastructure/serializers/jsonapi/campaign-assessment-participation-serializer.js';
import * as campaignProfileSerializer from '../../infrastructure/serializers/jsonapi/campaign-profile-serializer.js';
import { extractLocaleFromRequest } from '../../infrastructure/utils/request-response-utils.js';

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

const findTrainings = async function (request, h, dependencies = { trainingSerializer }) {
  const { userId } = request.auth.credentials;
  const { id: campaignParticipationId } = request.params;
  const locale = extractLocaleFromRequest(request);

  const trainings = await devcompUsecases.findCampaignParticipationTrainings({
    userId,
    campaignParticipationId,
    locale,
  });
  return dependencies.trainingSerializer.serialize(trainings);
};

const campaignParticipationController = {
  getAnalysis,
  getCampaignProfile,
  getCampaignAssessmentParticipation,
  deleteParticipation,
  getCampaignAssessmentParticipationResult,
  updateParticipantExternalId,
  deleteCampaignParticipationForAdmin,
  findTrainings,
};

export { campaignParticipationController };
