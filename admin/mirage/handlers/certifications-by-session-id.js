export function getCertificationsBySessionId(schema, request) {
  const sessionId = request.params.id;

  return schema.certifications.where({ sessionId });
}
