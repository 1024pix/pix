import { Response } from 'miragejs';

import { decodeToken } from 'mon-pix/helpers/jwt';

export default function (schema, request) {
  const payload = JSON.parse(request.requestBody);
  const attributes = payload?.data?.attributes;
  const userToken = request.requestHeaders.Authorization.replace('Bearer ', '');
  const userId = decodeToken(userToken).user_id;
  const user = schema.users.find(userId);

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
