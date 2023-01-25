import { getPaginationFromQueryParams, applyPagination } from './pagination-utils';

export function findFilteredPaginatedScoOrganizationParticipants(schema, request) {
  const organizationId = request.params.id;
  const queryParams = request.queryParams;
  const scoOrganizationParticipants = _filtersFromQueryParams(schema, organizationId, queryParams);

  const rowCount = scoOrganizationParticipants.length;

  const pagination = getPaginationFromQueryParams(queryParams);
  const paginatedScoOrganizationParticipants = applyPagination(scoOrganizationParticipants.models, pagination);

  const json = this.serialize(
    { modelName: 'sco-organization-participant', models: paginatedScoOrganizationParticipants },
    'sco-organization-participant'
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
    return schema.scoOrganizationParticipants.where(({ lastName }) => lastName.includes(lastNameFilter));
  }

  const firstNameFilter = queryParams['filter[firstName]'];
  if (firstNameFilter) {
    return schema.scoOrganizationParticipants.where(({ firstName }) => firstName.includes(firstNameFilter));
  }

  const connectionTypeFilter = queryParams['filter[connectionTypes]'];
  if (connectionTypeFilter) {
    return schema.scoOrganizationParticipants.where((scoOrganizationParticipant) => {
      if (connectionTypeFilter === '') return true;
      if (connectionTypeFilter.includes('identifiant') && scoOrganizationParticipant.hasUsername) return true;
      if (connectionTypeFilter.includes('email') && scoOrganizationParticipant.hasEmail) return true;
      if (connectionTypeFilter.includes('mediacentre') && scoOrganizationParticipant.isAuthenticatedFromGar)
        return true;
      return false;
    });
  }

  return schema.scoOrganizationParticipants.where({ organizationId });
}
