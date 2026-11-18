import { Response } from 'miragejs';

export default function (schema, request) {
  const userId = 1;
  const tutorialId = request.params.tutorialId;
  const tutorial = schema.tutorials.find(tutorialId);
  const user = schema.users.find(userId);

  if (!user) {
    return new Response(401);
  }

  if (!tutorial) {
    return new Response(404);
  }

  return schema.userSavedTutorials.create({ id: '1' });
}
