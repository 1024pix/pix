export function getToBePublishedSessions(schema, request) {
  const queryParams = request.queryParams;
  const toBePublishedSessions = schema.toBePublishedSessions.all();

  return toBePublishedSessions.filter((session) => `${session.version}` === queryParams['filter[version]']);
}
