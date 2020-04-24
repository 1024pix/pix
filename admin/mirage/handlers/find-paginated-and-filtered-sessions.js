import _ from 'lodash';

export function findPaginatedAndFilteredSessions(schema, request) {
  const queryParams = request.queryParams;
  const pageSize = queryParams ? parseInt(queryParams['page[size]']) : 10;
  const page = queryParams ? parseInt(queryParams['page[number]']) : 1;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const idFilter = queryParams ? queryParams['filter[id]'] : null;
  const certificationCenterNameFilter = queryParams ? queryParams['filter[certificationCenterName]'] : null;
  const statusFilter = queryParams ? queryParams['filter[status]'] : null;
  const resultsSentToPrescriberAtFilter = queryParams ? queryParams['filter[resultsSentToPrescriberAt]'] : null;
  const sessions = schema.sessions.all().models;
  const rowCount = sessions.length;

  // Apply filters
  let filteredSessions = sessions;
  if (idFilter) {
    filteredSessions = _.filter(filteredSessions, (session) => {
      return session.id === idFilter;
    });
  }
  if (certificationCenterNameFilter) {
    const filterName = certificationCenterNameFilter.toLowerCase();
    filteredSessions = _.filter(filteredSessions, (session) => {
      const currentName = session.certificationCenterName.toLowerCase();
      return currentName.search(filterName) !== -1;
    });
  }
  if (statusFilter) {
    filteredSessions = _.filter(filteredSessions, { status: statusFilter });
  }
  if (resultsSentToPrescriberAtFilter) {
    if (resultsSentToPrescriberAtFilter === 'true') {
      filteredSessions = _.filter(filteredSessions, (session) => {
        return Boolean(session.resultsSentToPrescriberAt);
      });
    }
    if (resultsSentToPrescriberAtFilter === 'false') {
      filteredSessions = _.filter(filteredSessions, (session) => {
        return !(session.resultsSentToPrescriberAt);
      });
    }
  }

  // Apply page size
  const sessionsToSend = _.slice(filteredSessions, start, end);

  const json = this.serialize({ modelName: 'session', models: sessionsToSend }, 'session');
  json.meta = {
    page,
    pageSize,
    rowCount,
    pageCount: Math.ceil(rowCount / pageSize),
  };
  return json;
}
