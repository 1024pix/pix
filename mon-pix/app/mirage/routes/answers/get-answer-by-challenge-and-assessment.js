export default function (schema, request) {
  const assessmentId = request.queryParams.assessmentId;
  const challengeId = request.queryParams.challengeId;

  const answers = schema.answers.where({ assessmentId, challengeId });

  if (answers.models.length !== 0) {
    return answers.models[0];
  }

  return { data: null };
}
