import { getChallengeLocale } from '../../../shared/infrastructure/utils/request-response-utils.js';
import { certificabilityByLabel } from '../../shared/application/helpers.js';
import { usecases } from '../domain/usecases/index.js';
import { campaignAssessmentResultMinimalSerializer } from '../infrastructure/serializers/jsonapi/campaign-assessment-result-minimal-serializer.js';
import { campaignCollectiveResultSerializer } from '../infrastructure/serializers/jsonapi/campaign-collective-result-serializer.js';
import { campaignProfilesCollectionParticipationSummarySerializer } from '../infrastructure/serializers/jsonapi/campaign-profiles-collection-participation-summary-serializer.js';

const findAssessmentParticipationResults = async function (
  request,
  h,
  dependencies = { campaignAssessmentResultMinimalSerializer },
) {
  const { campaignId } = request.params;
  const { page, filter: filters } = request.query;

  const paginatedParticipations = await usecases.findAssessmentParticipationResultList({
    campaignId,
    page,
    filters,
  });
  return dependencies.campaignAssessmentResultMinimalSerializer.serialize(paginatedParticipations);
};

const findProfilesCollectionParticipations = async function (request) {
  const { campaignId } = request.params;
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
  const { campaignId } = request.params;
  const locale = getChallengeLocale(request);

  const campaignCollectiveResult = await usecases.computeCampaignCollectiveResult({ userId, campaignId, locale });
  return dependencies.campaignCollectiveResultSerializer.serialize(campaignCollectiveResult);
};

const campaignResultsController = {
  findAssessmentParticipationResults,
  findProfilesCollectionParticipations,
  getCollectiveResult,
};

export { campaignResultsController };
