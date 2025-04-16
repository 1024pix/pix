import { Response } from 'miragejs';

export default function (schema, request) {
  const userId = 1;
  const tutorialId = request.params.tutorialId;
  const tutorial = schema.tutorials.find(tutorialId);
  const tutorialEvaluation = schema.tutorialEvaluations.find({ tutorialId, userId });
  const requestBody = JSON.parse(request.requestBody);
  const { status } = requestBody.data.attributes;
  const user = schema.users.find(userId);

  if (!user) {
    return new Response(401);
  }

  if (!tutorial) {
    return new Response(404);
  }

  if (!tutorialEvaluation) {
    return schema.tutorialEvaluations.create({ id: '1', tutorialId, tutorial, status });
  }
  return schema.tutorialEvaluations.update({ id: '1', tutorialId, tutorial, status });
}
