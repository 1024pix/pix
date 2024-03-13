import { applyPagination, getPaginationFromQueryParams } from './pagination-utils';

export function findPaginatedMissionLearners(schema, request) {
  const organizationId = request.params.organization_id;
  const queryParams = request.queryParams;
  const missionLearners = schema.missionLearners.where({ organizationId }).models;
  const rowCount = missionLearners.length;
  const pagination = getPaginationFromQueryParams(queryParams);
  const paginatedMissionLearners = applyPagination(missionLearners, pagination);

  const json = this.serialize({ modelName: 'missionLearners', models: paginatedMissionLearners }, 'membership');
  json.meta = {
    page: pagination.page,
    pageSize: pagination.pageSize,
    rowCount,
    pageCount: Math.ceil(rowCount / pagination.pageSize),
  };

  return json;
}
