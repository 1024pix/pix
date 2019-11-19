import Response from 'ember-cli-mirage/response';

export default function(schema, request) {
  const certificationCourseId = request.params.id;

  const certificationCourses = schema.certificationCourses.where({ id: certificationCourseId });
  if (certificationCourses.length !== 1) {
    return new Response(404);
  }
  return certificationCourses[0];
}
