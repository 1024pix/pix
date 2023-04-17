import filter from 'lodash/filter';

import { Response } from 'miragejs';
import { getPaginationFromQueryParams, applyPagination } from './pagination-utils';

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
            description: 'Filter on id field must be a number.',
          },
        ],
      }
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
  const idFilter = queryParams ? (queryParams['filter[id]'] ? queryParams['filter[id]'].trim() || null : null) : null;
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
  const resultsSentToPrescriberAtFilter = queryParams
    ? queryParams['filter[resultsSentToPrescriberAt]']
      ? queryParams['filter[resultsSentToPrescriberAt]'].trim() || null
      : null
    : null;
  return {
    idFilter,
    certificationCenterNameFilter,
    certificationCenterExternalIdFilter,
    statusFilter,
    resultsSentToPrescriberAtFilter,
  };
}

function _areFiltersValid({ idFilter }) {
  if (idFilter !== null) {
    const idAsNumber = parseInt(idFilter, 10);
    return !isNaN(idAsNumber);
  }

  return true;
}

function _applyFilters(
  sessions,
  {
    idFilter,
    certificationCenterNameFilter,
    certificationCenterExternalIdFilter,
    statusFilter,
    resultsSentToPrescriberAtFilter,
  }
) {
  let filteredSessions = sessions;
  if (idFilter) {
    filteredSessions = filter(filteredSessions, (session) => {
      return session.id === idFilter;
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
  if (resultsSentToPrescriberAtFilter) {
    if (resultsSentToPrescriberAtFilter === 'true') {
      filteredSessions = filter(filteredSessions, (session) => {
        return Boolean(session.resultsSentToPrescriberAt);
      });
    }
    if (resultsSentToPrescriberAtFilter === 'false') {
      filteredSessions = filter(filteredSessions, (session) => {
        return !session.resultsSentToPrescriberAt;
      });
    }
  }

  return filteredSessions;
}
