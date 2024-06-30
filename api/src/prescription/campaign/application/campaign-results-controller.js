import { extractLocaleFromRequest } from '../../../shared/infrastructure/utils/request-response-utils.js';
import { certificabilityByLabel } from '../../shared/application/helpers.js';
import { usecases } from '../domain/usecases/index.js';
import * as campaignAssessmentResultMinimalSerializer from '../infrastructure/serializers/jsonapi/campaign-assessment-result-minimal-serializer.js';
import * as campaignCollectiveResultSerializer from '../infrastructure/serializers/jsonapi/campaign-collective-result-serializer.js';
import * as campaignProfilesCollectionParticipationSummarySerializer from '../infrastructure/serializers/jsonapi/campaign-profiles-collection-participation-summary-serializer.js';

const findAssessmentParticipationResults = async function (request) {
  const campaignId = request.params.id;
  const { page, filter: filters } = request.query;
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

const findProfilesCollectionParticipations = async function (request) {
  const campaignId = request.params.id;
  const { page, filter: filters } = request.query;
  if (filters.divisions && !Array.isArray(filters.divisions)) {
    filters.divisions = [filters.divisions];
  }
  if (filters.groups && !Array.isArray(filters.groups)) {
    filters.groups = [filters.groups];
  }
  if (filters.certificability) {
    filters.certificability = certificabilityByLabel[filters.certificability];
  }
  const results = await usecases.findCampaignProfilesCollectionParticipationSummaries({
    campaignId,
    page,
    filters,
  });
  return campaignProfilesCollectionParticipationSummarySerializer.serialize(results);
};

const getCollectiveResult = async function (request, h, dependencies = { campaignCollectiveResultSerializer }) {
  const { userId } = request.auth.credentials;
  const campaignId = request.params.id;
  const locale = extractLocaleFromRequest(request);

  const campaignCollectiveResult = await usecases.computeCampaignCollectiveResult({ userId, campaignId, locale });
  return dependencies.campaignCollectiveResultSerializer.serialize(campaignCollectiveResult);
};

const campaignResultsController = {
  findAssessmentParticipationResults,
  findProfilesCollectionParticipations,
  getCollectiveResult,
};

export { campaignResultsController };
