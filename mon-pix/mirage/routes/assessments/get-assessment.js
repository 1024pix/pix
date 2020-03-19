export default function(schema, request) {
  const assessmentId = request.params.id;
  return schema.assessments.find(assessmentId);
}
