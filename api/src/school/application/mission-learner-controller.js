import { extractParameters } from '../../shared/infrastructure/utils/query-params-utils.js';
import { usecases } from '../domain/usecases/index.js';
import * as missionLearnerSerializer from '../infrastructure/serializers/mission-learner-serializer.js';

const findPaginatedMissionLearners = async function (request) {
  const { organizationId, missionId } = request.params;
  const { page, filter } = extractParameters(request.query);
  if (filter.divisions && !Array.isArray(filter.divisions)) {
    filter.divisions = [filter.divisions];
  }
  const result = await usecases.findPaginatedMissionLearners({ organizationId, missionId, page, filter });
  return missionLearnerSerializer.serialize(result);
};

const missionLearnerController = { findPaginatedMissionLearners };
export { missionLearnerController };
