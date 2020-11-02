import filter from 'lodash/filter';
import slice from 'lodash/slice';

import { Response } from 'ember-cli-mirage';

export function findPaginatedAndFilteredSessions(schema, request) {
  const queryParams = request.queryParams;
  const sessions = schema.sessions.all().models;
  const rowCount = sessions.length;

  const filters = _getFiltersFromQueryParams(queryParams);
  const pagination = _getPaginationFromQueryParams(queryParams);
  if (!_areFiltersValid(filters)) {
    return new Response(422, {}, {
      errors: [{
        status: 422,
        title: 'Invalid filters',
        description: 'Filter on id field must be a number.',
      }],
    });
  }
  const filteredSessions = _applyFilters(sessions, filters);
  const paginatedSessions = _applyPagination(filteredSessions, pagination);

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
  const idFilter = queryParams
    ? (queryParams['filter[id]'] ? queryParams['filter[id]'].trim() || null : null)
    : null;
  const certificationCenterNameFilter = queryParams
    ? (queryParams['filter[certificationCenterName]'] ? queryParams['filter[certificationCenterName]'].trim() || null : null)
    : null;
  const statusFilter = queryParams
    ? (queryParams['filter[status]'] ? queryParams['filter[status]'].trim() || null : null)
    : null;
  const resultsSentToPrescriberAtFilter = queryParams
    ? (queryParams['filter[resultsSentToPrescriberAt]'] ? queryParams['filter[resultsSentToPrescriberAt]'].trim() || null : null)
    : null;
  return {
    idFilter,
    certificationCenterNameFilter,
    statusFilter,
    resultsSentToPrescriberAtFilter,
  };
}

function _getPaginationFromQueryParams(queryParams) {
  return {
    pageSize: queryParams ? parseInt(queryParams['page[size]']) : 10,
    page: queryParams ? parseInt(queryParams['page[number]']) : 1,
  };
}

function _areFiltersValid({ idFilter }) {
  if (idFilter !== null) {
    const idAsNumber = parseInt(idFilter, 10);
    return !isNaN(idAsNumber);
  }

  return true;
}

function _applyFilters(sessions, { idFilter, certificationCenterNameFilter, statusFilter, resultsSentToPrescriberAtFilter }) {
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
        return !(session.resultsSentToPrescriberAt);
      });
    }
  }

  return filteredSessions;
}

function _applyPagination(sessions, { page, pageSize }) {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return slice(sessions, start, end);
}
