export default function(schema, request) {
  const assessmentId = request.queryParams.assessment;
  const challengeId = request.queryParams.challenge;

  const answers = schema.answers.where({ assessmentId, challengeId });

  if (answers.models.length !== 0) {
    return answers.models.get('firstObject');
  }

  return { data: null };
}
