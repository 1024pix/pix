export default function(schema, request) {
  const { id } = request.params;
  return schema.competenceEvaluations.where({ assessmentId: id });
}
