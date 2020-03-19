export default function(schema, request) {
  const attrs = JSON.parse(request.requestBody).data.attributes;
  return schema.certificationCourses.findBy({
    accessCode: attrs['access-code'],
    sessionId: parseInt(attrs['session-id'])
  });
}
