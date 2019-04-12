export default function(schema, request) {
  const params = JSON.parse(request.requestBody);

  const competenceId = params.data.attributes['competence-id'];

  const newAssessment = {
    type: 'COMPETENCE_EVALUATION',
  };

  const assessment = schema.assessments.create(newAssessment);
  return schema.competenceEvaluations.create({ assessment, competenceId });
}
