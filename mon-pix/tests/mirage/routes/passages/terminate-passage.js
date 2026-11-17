import { Response } from 'miragejs';

export default function (schema, request) {
  const passageId = request.params.passageId;
  const passage = schema.find('passage', passageId).update({ terminatedAt: new Date() });
  return new Response(200, {}, passage);
}
