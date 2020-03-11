import _ from 'lodash';

export function findPaginatedAndFilteredSessions(schema, request) {
  const pageSize = request.queryParams.page ? parseInt(request.queryParams.page.size) : 10;
  const filters = request.queryParams.filter;
  const sessions = schema.sessions.all().models;
  const allSessionsCount = sessions.length;
  // Apply filters
  let filteredSessions = sessions;
  if (filters && filters.id) {
    const filterId = filters.id;
    filteredSessions = _.map(sessions, (session) => {
      const currentSessionId = session.id;
      const match = currentSessionId.search(filterId);
      return match !== -1;
    });
  }
  // Apply sorting
  const sortedSessions = _.sortBy(filteredSessions, ['id']);
  // Apply page size
  const sessionsToSend = _.slice(sortedSessions, 0, pageSize);

  const json = this.serialize({ modelName: 'session', models: sessionsToSend }, 'session');
  json.meta = {
    page: 1,
    pageSize,
    rowCount: allSessionsCount,
    pageCount: Math.ceil(allSessionsCount / pageSize),
  };
  return json;
}
