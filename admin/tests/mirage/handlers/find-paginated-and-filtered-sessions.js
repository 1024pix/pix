import filter from 'lodash/filter';
import { Response } from 'miragejs';

import { applyPagination, getPaginationFromQueryParams } from './pagination-utils';

export function findPaginatedAndFilteredSessions(schema, request) {
  const queryParams = request.queryParams;
  const sessions = schema.sessions.all().models;
  const rowCount = sessions.length;

  const filters = _getFiltersFromQueryParams(queryParams);
  const pagination = getPaginationFromQueryParams(queryParams);
  if (!_areFiltersValid(filters)) {
    return new Response(
      422,
      {},
      {
        errors: [
          {
            status: 422,
            title: 'Invalid filters',
            description: 'Filter on ids field must only contain numbers.',
          },
        ],
      },
    );
  }
  const filteredSessions = _applyFilters(sessions, filters);
  const paginatedSessions = applyPagination(filteredSessions, pagination);

  const json = this.serialize({ modelName: 'session', models: paginatedSessions }, 'session');
  json.meta = {
    page: pagination.page,
    pageSize: pagination.pageSize,
    rowCount,
    pageCount: Math.ceil(rowCount / pagination.pageSize),
  };
  return json;
}

function _getFiltersFromQueryParams(queryParams) {
  const idsFilter = queryParams ? queryParams['filter[ids]'] || null : null;
  const certificationCenterNameFilter = queryParams
    ? queryParams['filter[certificationCenterName]']
      ? queryParams['filter[certificationCenterName]'].trim() || null
      : null
    : null;

  const certificationCenterExternalIdFilter = queryParams
    ? queryParams['filter[certificationCenterExternalId]']
      ? queryParams['filter[certificationCenterExternalId]'].trim() || null
      : null
    : null;
  const statusFilter = queryParams
    ? queryParams['filter[status]']
      ? queryParams['filter[status]'].trim() || null
      : null
    : null;
  const versionFilter = queryParams
    ? queryParams['filter[version]']
      ? queryParams['filter[version]'].trim() || null
      : null
    : null;
  return {
    idsFilter,
    certificationCenterNameFilter,
    certificationCenterExternalIdFilter,
    statusFilter,
    versionFilter,
  };
}

function _areFiltersValid({ idsFilter }) {
  if (idsFilter !== null) {
    return idsFilter.every((id) => !isNaN(parseInt(id, 10)));
  }

  return true;
}

function _applyFilters(
  sessions,
  { idsFilter, certificationCenterNameFilter, certificationCenterExternalIdFilter, statusFilter, versionFilter },
) {
  let filteredSessions = sessions;
  if (idsFilter) {
    filteredSessions = filter(filteredSessions, (session) => {
      return idsFilter.includes(session.id);
    });
  }
  if (certificationCenterNameFilter) {
    const filterName = certificationCenterNameFilter.toLowerCase();
    filteredSessions = filter(filteredSessions, (session) => {
      const currentName = session.certificationCenterName.toLowerCase();
      return currentName.search(filterName) !== -1;
    });
  }
  if (certificationCenterExternalIdFilter) {
    const filterName = certificationCenterExternalIdFilter.toLowerCase();
    filteredSessions = filter(filteredSessions, (session) => {
      const currentName = session.certificationCenterExternalId.toLowerCase();
      return currentName.search(filterName) !== -1;
    });
  }
  if (statusFilter) {
    filteredSessions = filter(filteredSessions, { status: statusFilter });
  }

  if (versionFilter) {
    filteredSessions = filter(filteredSessions, { version: +versionFilter });
  }

  return filteredSessions;
}
