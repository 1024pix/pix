import { monitoringTools } from '../../infrastructure/monitoring-tools.js';
import { usecases } from '../../domain/usecases/index.js';
import { usecases as devcompUsecases } from '../../../src/devcomp/domain/usecases/index.js';
import * as events from '../../domain/events/index.js';
import { extractParameters } from '../../infrastructure/utils/query-params-utils.js';
import * as campaignParticipationSerializer from '../../infrastructure/serializers/jsonapi/campaign-participation-serializer.js';
import * as campaignAnalysisSerializer from '../../infrastructure/serializers/jsonapi/campaign-analysis-serializer.js';
import * as campaignAssessmentParticipationSerializer from '../../infrastructure/serializers/jsonapi/campaign-assessment-participation-serializer.js';
import * as campaignAssessmentParticipationResultSerializer from '../../infrastructure/serializers/jsonapi/campaign-assessment-participation-result-serializer.js';
import * as campaignProfileSerializer from '../../infrastructure/serializers/jsonapi/campaign-profile-serializer.js';
import * as campaignAssessmentResultMinimalSerializer from '../../infrastructure/serializers/jsonapi/campaign-assessment-result-minimal-serializer.js';
import * as trainingSerializer from '../../../src/devcomp/infrastructure/serializers/jsonapi/training-serializer.js';
import { extractLocaleFromRequest } from '../../infrastructure/utils/request-response-utils.js';
import { DomainTransaction } from '../../infrastructure/DomainTransaction.js';

const save = async function (request, h, dependencies = { campaignParticipationSerializer, monitoringTools }) {
  const userId = request.auth.credentials.userId;
  const campaignParticipation = await dependencies.campaignParticipationSerializer.deserialize(request.payload);

  const { event, campaignParticipation: campaignParticipationCreated } = await DomainTransaction.execute(
    (domainTransaction) => {
      return usecases.startCampaignParticipation({ campaignParticipation, userId, domainTransaction });
    },
  );

  events.eventDispatcher
    .dispatch(event)
    .catch((error) => dependencies.monitoringTools.logErrorWithCorrelationIds({ message: error }));

  return h.response(dependencies.campaignParticipationSerializer.serialize(campaignParticipationCreated)).created();
};

const shareCampaignResult = async function (request) {
  const userId = request.auth.credentials.userId;
  const campaignParticipationId = request.params.id;

  await DomainTransaction.execute(async (domainTransaction) => {
    const event = await usecases.shareCampaignResult({
      userId,
      campaignParticipationId,
      domainTransaction,
    });
    await events.eventBus.publish(event, domainTransaction);
    return event;
  });

  return null;
};

const beginImprovement = async function (request) {
  const userId = request.auth.credentials.userId;
  const campaignParticipationId = request.params.id;

  return DomainTransaction.execute(async (domainTransaction) => {
    await usecases.beginCampaignParticipationImprovement({
      campaignParticipationId,
      userId,
      domainTransaction,
    });
    return null;
  });
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

const findAssessmentParticipationResults = async function (request) {
  const campaignId = request.params.id;
  const { page, filter: filters } = extractParameters(request.query);
  if (filters.divisions && !Array.isArray(filters.divisions)) {
    filters.divisions = [filters.divisions];
  }
  if (filters.groups && !Array.isArray(filters.groups)) {
    filters.groups = [filters.groups];
  }
  if (filters.badges && !Array.isArray(filters.badges)) {
    filters.badges = [filters.badges];
  }
  if (filters.stages && !Array.isArray(filters.stages)) {
    filters.stages = [filters.stages];
  }
  const paginatedParticipations = await usecases.findAssessmentParticipationResultList({
    campaignId,
    page,
    filters,
  });
  return campaignAssessmentResultMinimalSerializer.serialize(paginatedParticipations);
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
  save,
  shareCampaignResult,
  beginImprovement,
  getAnalysis,
  getCampaignProfile,
  getCampaignAssessmentParticipation,
  deleteParticipation,
  getCampaignAssessmentParticipationResult,
  findAssessmentParticipationResults,
  updateParticipantExternalId,
  deleteCampaignParticipationForAdmin,
  findTrainings,
};

export { campaignParticipationController };
