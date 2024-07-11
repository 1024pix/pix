import { applyPagination, getPaginationFromQueryParams } from './pagination-utils';

export function findPaginatedMissionLearners(schema, request) {
  const organizationId = request.params.organization_id;
  const queryParams = request.queryParams;
  const divisionsFilter = queryParams['filter[divisions]'];
  const nameFilter = queryParams['filter[name]'];

  let missionLearners = schema.missionLearners.where({ organizationId });
  if (divisionsFilter) {
    missionLearners = missionLearners.filter((learner) => {
      return divisionsFilter.includes(learner.division) && learner.organizationId === Number(organizationId);
    });
  }

  if (nameFilter) {
    missionLearners = missionLearners.filter((learner) => {
      return (
        (learner.firstName.toUpperCase().includes(nameFilter.toUpperCase()) ||
          learner.lastName.toUpperCase().includes(nameFilter.toUpperCase())) &&
        learner.organizationId === Number(organizationId)
      );
    });
  }
  const rowCount = missionLearners.length;
  const pagination = getPaginationFromQueryParams(queryParams);
  const paginatedMissionLearners = applyPagination(missionLearners.models, pagination);

  const json = this.serialize({ modelName: 'missionLearners', models: paginatedMissionLearners }, 'membership');
  json.meta = {
    page: pagination.page,
    pageSize: pagination.pageSize,
    rowCount,
    pageCount: Math.ceil(rowCount / pagination.pageSize),
  };

  return json;
}
