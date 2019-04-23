export default function(schema, request) {
  const params = JSON.parse(request.requestBody);

  const competenceId = params.data.attributes['competence-id'];

  if (competenceId === 'wrongId') {
    return schema.competenceEvaluations.find(null);
  }

  const newAssessment = {
    type: 'COMPETENCE_EVALUATION',
  };

  const assessment = schema.assessments.create(newAssessment);
  return schema.competenceEvaluations.create({ assessment, competenceId });
}
