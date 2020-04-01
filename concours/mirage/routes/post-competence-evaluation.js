import { Response } from 'ember-cli-mirage';

export default function(schema, request) {
  const params = JSON.parse(request.requestBody);
  const competenceId = params.competenceId;
  if (competenceId === 'nonExistantCompetenceId')
  {
    return new Response(404, {}, { errors: [ { status: '404', detail: '' } ] });
  }
  const existingCompetenceEvaluation = schema.competenceEvaluations.findBy({ competenceId });
  if (existingCompetenceEvaluation) {
    return existingCompetenceEvaluation;
  }
  const assessment = schema.assessments.create({ type: 'COMPETENCE_EVALUATION' });
  return schema.competenceEvaluations.create({ assessment, competenceId });
}
