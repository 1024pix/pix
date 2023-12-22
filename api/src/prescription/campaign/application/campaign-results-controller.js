import * as campaignAssessmentResultMinimalSerializer from '../infrastructure/serializers/jsonapi/campaign-assessment-result-minimal-serializer.js';
import * as campaignProfilesCollectionParticipationSummarySerializer from '../infrastructure/serializers/jsonapi/campaign-profiles-collection-participation-summary-serializer.js';

import { certificabilityByLabel } from '../../shared/application/helpers.js';

import { extractParameters } from '../../../../lib/infrastructure/utils/query-params-utils.js';

import { usecases } from '../domain/usecases/index.js';

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

const findProfilesCollectionParticipations = async function (request) {
  const campaignId = request.params.id;
  const { page, filter: filters } = extractParameters(request.query);
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

const campaignResultsController = {
  findAssessmentParticipationResults,
  findProfilesCollectionParticipations,
};

export { campaignResultsController };
