import { Response } from 'miragejs';

import { decodeToken } from 'mon-pix/helpers/jwt';

export default function (schema, request) {
  const payload = JSON.parse(request.requestBody);
  const userToken = request.requestHeaders.Authorization.replace('Bearer ', '');
  const userId = decodeToken(userToken).user_id;
  const user = schema.users.find(userId);

  if (payload['current-password'] !== user.password) {
    return new Response(
      400,
      {},
      {
        errors: [{ status: '400', detail: 'Le mot de passe que vous avez saisi est invalide.' }],
      },
    );
  }

  user.update({ password: payload['new-password'] });

  return new Response(204);
}
