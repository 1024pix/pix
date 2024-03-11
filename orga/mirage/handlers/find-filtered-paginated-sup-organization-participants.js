import { applyPagination, getPaginationFromQueryParams } from './pagination-utils';

export function findFilteredPaginatedSupOrganizationParticipants(schema, request) {
  const organizationId = request.params.id;
  const queryParams = request.queryParams;
  const supOrganizationParticipants = _filtersFromQueryParams(schema, organizationId, queryParams);

  const rowCount = supOrganizationParticipants.length;

  const pagination = getPaginationFromQueryParams(queryParams);
  const paginatedSupOrganizationParticipants = applyPagination(supOrganizationParticipants.models, pagination);

  const json = this.serialize(
    { modelName: 'sup-organization-participant', models: paginatedSupOrganizationParticipants },
    'sup-organization-participant',
  );
  json.meta = {
    page: pagination.page,
    pageSize: pagination.pageSize,
    rowCount,
    pageCount: Math.ceil(rowCount / pagination.pageSize),
  };
  return json;
}

function _filtersFromQueryParams(schema, organizationId, queryParams) {
  const lastNameFilter = queryParams['filter[lastName]'];
  if (lastNameFilter) {
    return schema.supOrganizationParticipants.where(({ lastName }) => lastName.includes(lastNameFilter));
  }

  const firstNameFilter = queryParams['filter[firstName]'];
  if (firstNameFilter) {
    return schema.supOrganizationParticipants.where(({ firstName }) => firstName.includes(firstNameFilter));
  }

  const groupFilter = queryParams['filter[groups]'];
  if (groupFilter) {
    return schema.supOrganizationParticipants.where(({ group }) => group.includes(groupFilter));
  }

  return schema.supOrganizationParticipants.where({ organizationId });
}
