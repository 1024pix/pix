export function getWithRequiredActionSessions(schema, request) {
  const queryParams = request.queryParams;
  const withRequiredActionSessions = schema.withRequiredActionSessions.all();

  return withRequiredActionSessions.filter((session) => `${session.version}` === queryParams['filter[version]']);
}
