export default function (schema, request) {
  const assessmentId = request.params.id;
  const assessment = schema.assessments.find(assessmentId);
  assessment.update({ lastQuestionState: 'focusedout' });
  return assessment;
}
