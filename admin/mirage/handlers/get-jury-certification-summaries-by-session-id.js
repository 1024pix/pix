export function getJuryCertificationSummariesBySessionId(schema, request) {
  return schema.sessions.find(request.params.id).juryCertificationSummaries;
}
