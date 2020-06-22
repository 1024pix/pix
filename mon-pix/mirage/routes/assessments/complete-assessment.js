export default function(schema, request) {
  const assessmentId = request.params.id;
  const assessment = schema.assessments.find(assessmentId);
  assessment.update({ state: 'completed' });
  if (assessment.type === 'CAMPAIGN') {
    const campaignParticipationResult = schema.campaignParticipationResults.create();
    const campaignParticipation = schema.campaignParticipations.findBy({ assessmentId });
    campaignParticipation.update({ campaignParticipationResult });
  }

  return assessment;
}
