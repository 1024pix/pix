import { applyPagination, getPaginationFromQueryParams } from './pagination-utils';

export function findFilteredPaginatedOrganizationParticipants(schema, request) {
  const organizationId = request.params.id;
  const queryParams = request.queryParams;
  const organizationParticipants = schema.organizationParticipants.where({ organizationId });

  const rowCount = organizationParticipants.length;

  const pagination = getPaginationFromQueryParams(queryParams);
  const paginatedParticipants = applyPagination(organizationParticipants.models, pagination);

  const json = this.serialize(
    { modelName: 'organization-participant', models: paginatedParticipants },
    'organization-participant',
  );
  json.meta = {
    page: pagination.page,
    pageSize: pagination.pageSize,
    rowCount,
    pageCount: Math.ceil(rowCount / pagination.pageSize),
    participantCount: rowCount,
  };
  return json;
}
