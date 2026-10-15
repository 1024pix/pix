import { Response } from 'miragejs';

export default function (schema, request) {
  const payload = JSON.parse(request.requestBody);
  const attributes = payload?.data?.attributes;
  const user = schema.users.find(request.params.id);

  if (attributes?.['current-password'] !== user.password) {
    return new Response(
      400,
      {},
      {
        errors: [{ status: '400', detail: 'Le mot de passe que vous avez saisi est invalide.' }],
      },
    );
  }

  user.update({ password: attributes['new-password'] });

  return new Response(204);
}
