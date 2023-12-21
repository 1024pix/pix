import { extractParameters } from '../../../../lib/infrastructure/utils/query-params-utils.js';
import * as campaignAssessmentResultMinimalSerializer from '../infrastructure/serializers/jsonapi/campaign-assessment-result-minimal-serializer.js';

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

const campaignParticipationController = {
  findAssessmentParticipationResults,
};

export { campaignParticipationController };
